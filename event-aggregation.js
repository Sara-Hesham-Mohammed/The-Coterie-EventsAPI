import axios from "axios";
import dotenv from "dotenv";
import EventDTO from "./DTO/EventDTO.js";
import LocationDTO from "./DTO/LocationDTO.js";

dotenv.config({
  path: "./config/.env",
});

let ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;

async function eventsAggregationByCountry(countryCode) {
  try {
    // Fetching from multiple sources
    const sources = [
      `https://app.ticketmaster.com/discovery/v2/events.json?size=10&countryCode=${countryCode}&apikey=${ticketmasterApiKey}`,
    ];

    //size limited to 10 and fetch again if needed
    const [res1] = await Promise.all([axios.get(sources[0])]);

    //combining the sources + deconstructing them in a single array
    const allEvents = [res1.data?._embedded?.events || ["Source One Error"]];

    //map to store the final events
    const eventMap = new Map();

    //mapping each one and giving it a unique key, if there's an event with same name and such
    // يبقى ده already exists and won't be added to our list of events
    // TODO: fix this, make the data sources conform to a data schema and then use that schema to check for dupes
    try {
      allEvents.forEach((eventList) => {
        if (Array.isArray(eventList)) {
          eventList.forEach((event) => {
            // Helper function to safely get address
            const getAddress = (event) => {
              // Check for PredictHQ format (geo.geometry)
              if (
                event.geo &&
                event.geo.geometry &&
                event.geo.geometry.address
              ) {
                return event.geo.geometry.address;
              }

              // Check for Ticketmaster format (_embedded.venues)
              if (
                event._embedded &&
                event._embedded.venues &&
                event._embedded.venues.length > 0
              ) {
                const venue = event._embedded.venues[0];
                return {
                  line: venue.address?.line1 || "No Address",
                  city: venue.city?.name || "No City",
                  country: venue.country?.name || "No Country",
                };
              }

              // Default fallback
              return {
                line: "No Address",
                city: "No City",
                country: "No Country",
              };
            };

            // Helper function to safely get coordinates
            const getCoordinates = (event) => {
              // Check for PredictHQ format
              if (
                event.geo &&
                event.geo.geometry &&
                event.geo.geometry.coordinates
              ) {
                return event.geo.geometry.coordinates;
              }

              // Check for Ticketmaster format
              if (
                event._embedded &&
                event._embedded.venues &&
                event._embedded.venues.length > 0
              ) {
                const venue = event._embedded.venues[0];
                if (venue.location) {
                  return {
                    long: venue.location.longitude,
                    lat: venue.location.latitude,
                  };
                }
              }

              // Default fallback
              return { long: 0, lat: 0 };
            };

            // Helper function to safely get location link
            const getLocationLink = (event) => {
              if (event.geo && event.geo.geometry && event.geo.geometry.link) {
                return event.geo.geometry.link;
              }
              return "No Location Link";
            };

            // Create a new EventDTO instance
            const eventDTO = new EventDTO({
              name: event.name || event.title || "No Name",
              description: event.description || "No Description",
              location: new LocationDTO(
                getAddress(event),
                getCoordinates(event),
                getLocationLink(event)
              ),
              startDate:
                event.dates?.start?.dateTime || event.start_local || null,
              endDate: event.dates?.end?.localDate || event.end_local || null,
              images: event.images?.map((img) => img.url) || null,
            });

            //unique key
            const uniqueKey = `${eventDTO.name} at ${eventDTO.location.address.line} in ${eventDTO.location.address.city}`;
            console.log(`Processing event: ${uniqueKey}`);

            // Add only if it doesn't already exist
            if (!eventMap.has(uniqueKey)) {
              eventMap.set(uniqueKey, eventDTO); // Store the DTO, not the raw event
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

export { eventsAggregationByCountry };
