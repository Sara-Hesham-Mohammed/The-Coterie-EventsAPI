import express from "express";
import dotenv from "dotenv";

// App setup
const app = express();
dotenv.config({
  path: "./config/.env",
});
const PORT = process.env.PORT;


app.get("/", async (req, res) => {
  res.send("HI FROM EXTERNAL APIS");
});

app.get("/all-events", async (req, res) => {
  
  eventsAggregationByCountry('IE').then((events) => console.log(events));

});

app.get("/events/:location", async (req, res) => {
  var loc = req.params.location;
});

app.get("/event/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const event = data.find((event) => event.id === id);
  if (!event) {
    res.status(404).json({ error: "event not found" });
  } else {
    res.json(event);
  }
});

app.listen(PORT, async () => {
  //init server first THEN DB....for obvious reasons
  console.log(`Listening on port ${PORT}`);
});

// App failsafes? ig
app.use((req, res, next) => {
  console.log("Request received");
  next();
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
