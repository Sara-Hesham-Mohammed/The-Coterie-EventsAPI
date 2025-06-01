import express from "express";
import dotenv from "dotenv";
import { eventsAggregationByCountry } from "./event-aggregation.js";
import { scrapeEvents } from "./web-scraper.js";

// App setup
const app = express();
dotenv.config({
  path: "./config/.env",
});
const PORT = process.env.PORT;

app.get("/", async (req, res) => {
  res.send("HI FROM EXTERNAL APIS");
});

app.get("/all-events/:country", async (req, res) => {
  console.log(`Fetching events for country: ${req.params.country}`);

  const events = [];
  const countryCode = req.params.country;

  // Get aggregated events
  const countryEvents = await eventsAggregationByCountry(countryCode);
  events.push(...countryEvents);

  // // If Egypt, also scrape
  // if (countryCode.toUpperCase() === "EG") {
  //   const scrapedEvents = await scrapeEvents();
  //   events.push(...scrapedEvents);
  // }

  // Send the response ONCE
  res.status(200).json(events);
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
