const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// EVENT BROKER
// stupidly simple implementation (not great but works)
// NOT TO BE USED IN A REAL ENV. THIS IS FOR UNDERSTANDING FUNDEMENTALS ONLY

// storage for all events
const events = [];

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);
  // we do not know what the event is yet
  // send to all our services
  axios.post("http://localhost:4000/events", event);
  axios.post("http://localhost:4001/events", event);
  axios.post("http://localhost:4002/events", event);
  axios.post("http://localhost:4003/events", event);

  res.send({ status: "OK" });
});

// send all events received when requested
app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("Listening on 4005");
});
