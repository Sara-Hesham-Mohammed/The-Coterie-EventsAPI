import axios from "axios";
import dotenv from "dotenv";
import { EventDTO } from "./EventDTO.js"; // Assuming you have an EventDTO type defined

dotenv.config({
  path: "./config/.env",
});

const ticketmasterApiKey: string | undefined = process.env.TICKETMASTER_API_KEY;
const predicthqApiKey: string | undefined = process.env.PREDICTHQ_API_KEY;


async function eventsAggregationByCountry(countryCode: string): Promise<EventDTO[]> {
  try {
    // Fetching from multiple sources
    const sources: string[] = [
      `https://app.ticketmaster.com/discovery/v2/events.json?size=10&countryCode=${countryCode}&apikey=${ticketmasterApiKey}`,
      `https://api.predicthq.com/v1/events/?country=${countryCode}&limit=10`,
      "https://api.source3.com/events",
    ];

    // size limited to 10 and fetch again if needed
    const [res1, res2] = await Promise.all([
      axios.get(sources[0]),
      axios.get(sources[1], {
        headers: {
          Authorization: `Bearer ${predicthqApiKey}`,
          Accept: "application/json",
        },
      }),
    ]);

    // combining the sources + deconstructing them in a single array
    const allEvents: any[][] = [
      res1.data?._embedded?.events || ["Source One Error"],
      res2.data?.results || ["Source Two Error"],
    ];

    // map to store the final events
    const eventMap: Map<string, EventDTO> = new Map();

    // mapping each one and giving it a unique key
    try {
      allEvents.forEach((eventList) => {
        if (Array.isArray(eventList)) {
          eventList.forEach((event: EventDTO) => {
            // unique key
            const uniqueKey = `${event.eventTitle}-${event.startTime}-${event.location}`;
            // Add only if it doesn't already exist
            if (!eventMap.has(uniqueKey)) {
              eventMap.set(uniqueKey, event);
            }
          });
        }
      });
    } catch (err) {
      console.error("Error processing events:", err);
    }

    // Convert Map back to an array
    const uniqueEvents: EventDTO[] = Array.from(eventMap.values());

    return uniqueEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export { eventsAggregationByCountry };
