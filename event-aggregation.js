import axios from "axios";
import dotenv from "dotenv";
dotenv.config({
  path: "./config/.env",
});

let ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;

async function eventsAggregationByCountry(countryCode) {
  try {
    /*  // Fetching from multiple sources
    const [res1, res2, res3] = await Promise.all([
      axios.get(`https://app.ticketmaster.com/discovery/v2/events.json?size=2&apikey=${ticketmasterApiKey}&countryCode=${countryCode}`),
      axios.get("https://api.source2.com/events"),
      axios.get("https://api.source3.com/events"),
    ]);

    //combining the sources + deconstructing them in a single array
    const allEvents = [...res1.data, ...res2.data, ...res3.data]; */
    
    //size limited to 10 and fetch again if needed
    const [res1] = await Promise.all([
      axios.get(
        `https://app.ticketmaster.com/discovery/v2/events.json?size=10&countryCode=${countryCode}&apikey=${ticketmasterApiKey}`
      ),
    ]);

    // Extract events safely
    const allEvents = res1.data?._embedded?.events || [];

    //map to store the final events
    const eventMap = new Map();

    //mapping each one and giving it a unique key, if there's an event with same name and such
    // يبقى ده already exists and won't be added to our list of events
    allEvents.forEach((event) => {
      //unique key
      const uniqueKey = `${event.name}-${event.date}-${event.location}`;
      // Add only if it doesn't already exist
      if (!eventMap.has(uniqueKey)) {
        eventMap.set(uniqueKey, event);
      }
    });

    // Convert Map back to an array
    const uniqueEvents = Array.from(eventMap.values());

    return uniqueEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export { eventsAggregationByCountry };
