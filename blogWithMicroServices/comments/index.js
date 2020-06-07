const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const { randomBytes } = require("crypto");

const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
/*
data structure
{
    postId:[comments array]
}
*/
const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  // use parameter ID to see if there is a instance of the ID in array else give empty array
  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: "pending" });

  // When created is complete send a event to event broker
  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: "pending",
    },
  });
  commentsByPostId[req.params.id] = comments;

  res.status(201).send(comments);
});

// Get the event emitted from event broker
app.post("/events", async (req, res) => {
  console.log("Received Event: ", req.body.type);
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.id === id);

    comment.status = status;

    await axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        content,
        status,
        postId,
      },
    });
  }
  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
