import axios from "axios";
import dotenv from "dotenv";
dotenv.config({
  path: "./config/.env",
});

let ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;

async function eventsAggregationByCountry(countryCode) {
  try {
    // Fetching from multiple sources
    const sources = [
      `https://app.ticketmaster.com/discovery/v2/events.json?size=10&countryCode=${countryCode}&apikey=${ticketmasterApiKey}`,
      `https://api.predicthq.com/v1/events/?country=${countryCode}&limit=10`,
      "https://api.source3.com/events",
    ];

    //size limited to 10 and fetch again if needed
    const [res1, res2] = await Promise.all([
      axios.get(sources[0]),
      axios.get(sources[1], {
        headers: {
          Authorization: `Bearer ${process.env.PREDICTHQ_API_KEY}`,
          Accept: "application/json",
        },
      }),
    ]);

    //combining the sources + deconstructing them in a single array
    const allEvents = [res1.data?._embedded?.events|| ['Source One Error'], res2.data?.results || ['Source Two Error']];

    //map to store the final events
    const eventMap = new Map();

    //mapping each one and giving it a unique key, if there's an event with same name and such
    // يبقى ده already exists and won't be added to our list of events
    try {
      allEvents.forEach((eventList) => {
        if (Array.isArray(eventList)) {
          eventList.forEach((event) => {
            //unique key
            const uniqueKey = `${event.name}-${event.date}-${event.location}`;
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
    const uniqueEvents = Array.from(eventMap.values());

    return uniqueEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

eventsAggregationByCountry("IE");

export { eventsAggregationByCountry };
