import puppeteer from "puppeteer";
import { EventStatus } from "./EventDTO.js";
let globalEventId = 1;
function getNextEventId() {
    return globalEventId++;
}
async function scrapeTicketsMarche(page, events) {
    await page.goto("https://www.ticketsmarche.com/Event_filter_grid/Eventlist_filter", { waitUntil: "networkidle2" });
    const ticketsMarcheEvents = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".event-card-info")).map((event) => ({
            eventTitle: event.querySelector(".event-name")?.innerText.trim() || "",
            startTime: event.querySelector(".event-date")?.innerText.trim() || "",
            status: EventStatus.UPCOMING,
            location: {
                country: "Egypt",
                address: event.querySelector(".event-venue")?.innerText.trim() || "",
                link: "N/A"
            }
        }));
    });
    const withIds = ticketsMarcheEvents.map(e => ({
        ...e,
        eventId: getNextEventId(),
        status: EventStatus.UPCOMING
    }));
    console.log(withIds);
    events.push(withIds);
}
async function scrapeTazkarti(page, events) {
    let tazkartiEvents = [];
    await page.goto("https://www.tazkarti.com/#/events/categories", {
        waitUntil: "networkidle2",
    });
    await page.waitForSelector("div.ng-star-inserted");
    const cardCount = await page.$$eval("div.ng-star-inserted", (cards) => cards.length);
    for (let i = 0; i < cardCount; i++) {
        const cards = await page.$$("div.ng-star-inserted");
        console.log(`CARDS: ${cards}`);
        if (!cards[i]) {
            console.warn(`Card ${i} is undefined`);
            continue;
        }
        else {
            console.log(`Card ${i} found`);
        }
        const link = await cards[i].$("a.eventCategory");
        if (!link)
            continue;
        await Promise.all([
            link.click(),
            page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);
        await new Promise((res) => setTimeout(res, 2000));
        console.log("WAITING TO START SCRAPING");
        const singleEvent = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a[target="_blank"]'));
            const mapsAnchor = anchors.find((a) => a.href.includes("google.com/maps"));
            const locationLink = mapsAnchor?.href || "";
            const locationName = document.querySelector('.venuLinkgooglemap')?.innerText.trim() || "NOT FOUND";
            return {
                eventTitle: document.querySelector(".name")?.innerText.trim() || "",
                startTime: document.querySelector(".startDateWithMinPRice")?.innerText.trim() ||
                    "",
                status: EventStatus.UPCOMING,
                minPrice: document.querySelector(".minPrice")?.innerText.trim() || "",
                location: {
                    country: "Egypt",
                    address: locationName,
                    link: locationLink
                },
            };
        });
        tazkartiEvents.push({
            ...singleEvent,
            eventId: getNextEventId(),
            status: EventStatus.UPCOMING
        });
        await Promise.all([page.goBack({ waitUntil: "networkidle0" })]);
        await new Promise((res) => setTimeout(res, 2000));
        console.log("WAITING FOR PAGE REFRESH");
    }
    events.push(tazkartiEvents);
}
async function scrapeEvents() {
    globalEventId = 1;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let events = [];
    try {
        await scrapeTicketsMarche(page, events);
    }
    catch (error) {
        console.error("Error scraping TicketsMarche:", error);
    }
    try {
        await scrapeTazkarti(page, events);
    }
    catch (error) {
        console.error("Error scraping Tazkarti:", error);
    }
    await browser.close();
    events.forEach(eventList => {
        eventList.forEach(event => {
            console.log(event);
        });
    });
    return events;
}
scrapeEvents();
export { scrapeEvents };
//# sourceMappingURL=web-scraper.js.map