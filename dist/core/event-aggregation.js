import axios from "axios";
import dotenv from "dotenv";
dotenv.config({
    path: "./config/.env",
});
const ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;
const predicthqApiKey = process.env.PREDICTHQ_API_KEY;
async function eventsAggregationByCountry(countryCode) {
    try {
        const sources = [
            `https://app.ticketmaster.com/discovery/v2/events.json?size=10&countryCode=${countryCode}&apikey=${ticketmasterApiKey}`,
            `https://api.predicthq.com/v1/events/?country=${countryCode}&limit=10`,
            "https://api.source3.com/events",
        ];
        const [res1, res2] = await Promise.all([
            axios.get(sources[0]),
            axios.get(sources[1], {
                headers: {
                    Authorization: `Bearer ${predicthqApiKey}`,
                    Accept: "application/json",
                },
            }),
        ]);
        const allEvents = [
            res1.data?._embedded?.events || ["Source One Error"],
            res2.data?.results || ["Source Two Error"],
        ];
        const eventMap = new Map();
        try {
            allEvents.forEach((eventList) => {
                if (Array.isArray(eventList)) {
                    eventList.forEach((event) => {
                        const uniqueKey = `${event.eventTitle}-${event.startTime}-${event.location}`;
                        if (!eventMap.has(uniqueKey)) {
                            eventMap.set(uniqueKey, event);
                        }
                    });
                }
            });
        }
        catch (err) {
            console.error("Error processing events:", err);
        }
        const uniqueEvents = Array.from(eventMap.values());
        return uniqueEvents;
    }
    catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}
export { eventsAggregationByCountry };
//# sourceMappingURL=event-aggregation.js.map