// Make express app
const express = require("express");

const axios = require("axios");
// can generate random number
const { randomBytes } = require("crypto");

// body parser for express bodys'
const bodyParser = require("body-parser");

// set up cors handling
const cors = require("cors");

//init the app
const app = express();

// use JSON parser
app.use(bodyParser.json());
app.use(cors());
// 'database' for all posts while online
const posts = {};
// Store in memory for testing.
// Ideally you would store in a service specific database

// return all the posts in storage
app.get("/posts", (req, res) => {
  res.send(posts);
});

// create a new post
app.post("/posts", async (req, res) => {
  // generate a random string of 4 bytes in hex value
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;
  posts[id] = {
    id,
    title,
  };

  // Make a post request to event broker
  await axios.post("http://localhost:4005/events", {
    type: "PostCreated",
    data: {
      id,
      title,
    },
  });

  // 201 status for OK, send back post
  res.status(201).send(posts[id]);
});

// Get the event emitted from event broker
app.post("/events", (req, res) => {
  console.log("Received Event: ", req.body.type);

  res.send({});
});

// start express app on port 4k
app.listen(4000, () => {
  console.log("listening on port 4000");
});
