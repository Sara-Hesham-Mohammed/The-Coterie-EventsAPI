import express from "express";
import dotenv from "dotenv";
import { eventsAggregationByCountry } from "./core/event-aggregation.js";
import { scrapeEvents } from "./core/web-scraper.js";
const app = express();
dotenv.config({
    path: "./config/.env",
});
const PORT = process.env.PORT || 3000;
app.get("/", async (_req, res) => {
    res.send("HI FROM EXTERNAL APIS");
});
app.get("/all-events", async (_req, _res) => {
    eventsAggregationByCountry("IE").then((events) => console.log(events));
});
app.get("/events/:country", async (req, res) => {
    const events = [];
    const countryCode = String(req.params.country);
    await eventsAggregationByCountry(countryCode).then((countryEvents) => {
        console.log(countryEvents);
        events.push(...countryEvents);
    });
    if (countryCode === "EG") {
        const scrapedEvents = await scrapeEvents();
        events.push(scrapedEvents);
    }
    res.send(events);
});
app.get("/event/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const event = data.find((event) => event.id === id);
    if (!event) {
        res.status(404).json({ error: "event not found" });
    }
    else {
        res.json(event);
    }
});
app.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}`);
});
app.use((req, _res, next) => {
    console.log("Request received");
    next();
});
app.use((err, _req, res, _next) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});
//# sourceMappingURL=index.js.map