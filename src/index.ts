import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { eventsAggregationByCountry } from "./core/event-aggregation.js";
import { scrapeEvents } from "./core/web-scraper.js";

// App setup
const app = express();
dotenv.config({
  path: "./config/.env",
});
const PORT = process.env.PORT || 3000;

app.get("/", async (_req: Request, res: Response) => {
  res.send("HI FROM EXTERNAL APIS");
});

app.get("/all-events", async (_req: Request, _res: Response) => {
  eventsAggregationByCountry("IE").then((events) => console.log(events));
});

app.get("/events/:country", async (req: Request, res: Response) => {
  const events: any[] = [];
  const countryCode = String(req.params.country);
  await eventsAggregationByCountry(countryCode).then((countryEvents: any[]) => {
    console.log(countryEvents);
    events.push(...countryEvents);
  });
  if (countryCode === "EG") {
    const scrapedEvents = await scrapeEvents(); // check if it needs destructuring
    events.push(scrapedEvents);
  }

  res.send(events);
});

app.get("/event/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  // @ts-ignore: 'data' is not defined in this file, define or import as needed
  const event = data.find((event: any) => event.id === id);
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
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log("Request received");
  next();
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
