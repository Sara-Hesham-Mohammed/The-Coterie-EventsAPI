import puppeteer, { Page, Browser } from "puppeteer";
import { EventDTO, EventStatus } from "./EventDTO.js";

// Helper for generating unique IDs
let globalEventId = 1;
function getNextEventId(): number {
  return globalEventId++;
}

async function scrapeTicketsMarche(page: Page, events: EventDTO[][]): Promise<void> {
  await page.goto(
    "https://www.ticketsmarche.com/Event_filter_grid/Eventlist_filter",
    { waitUntil: "networkidle2" }
  );

  const ticketsMarcheEvents: Omit<EventDTO, "eventId">[] = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".event-card-info")).map(
      (event) => ({
        eventTitle: (event.querySelector(".event-name") as HTMLElement)?.innerText.trim() || "",
        startTime: (event.querySelector(".event-date") as HTMLElement)?.innerText.trim() || "",
        status: EventStatus.UPCOMING as const,
        location: {
          country: "Egypt",
          address: (event.querySelector(".event-venue") as HTMLElement)?.innerText.trim() || "",
          link: "N/A"
        }
      })
    );
  });

  // Assign auto-incremented IDs and correct status type
  const withIds: EventDTO[] = ticketsMarcheEvents.map(e => ({
    ...e,
    eventId: getNextEventId(),
    status: EventStatus.UPCOMING as const
  }));

  console.log(withIds);
  events.push(withIds);
}

async function scrapeTazkarti(page: Page, events: EventDTO[][]): Promise<void> {
  let tazkartiEvents: EventDTO[] = [];

  await page.goto("https://www.tazkarti.com/#/events/categories", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector("div.ng-star-inserted");

  const cardCount = await page.$$eval(
    "div.ng-star-inserted",
    (cards) => cards.length
  );

  for (let i = 0; i < cardCount; i++) {
    const cards = await page.$$("div.ng-star-inserted");
    console.log(`CARDS: ${cards}`);

    if (!cards[i]) {
      console.warn(`Card ${i} is undefined`);
      continue;
    } else {
      console.log(`Card ${i} found`);
    }
    const link = await cards[i].$("a.eventCategory");
    if (!link) continue;
    await Promise.all([
      link.click(),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    await new Promise((res) => setTimeout(res, 2000));
    console.log("WAITING TO START SCRAPING");

    const singleEvent: Omit<EventDTO, "eventId"> = await page.evaluate(() => {
      const anchors = Array.from(
        document.querySelectorAll('a[target="_blank"]')
      );
      const mapsAnchor = anchors.find((a) =>
        (a as HTMLAnchorElement).href.includes("google.com/maps")
      );
      const locationLink = (mapsAnchor as HTMLAnchorElement | undefined)?.href || "";
      const locationName = (document.querySelector('.venuLinkgooglemap') as HTMLElement)?.innerText.trim() || "NOT FOUND";

      return {
        eventTitle: (document.querySelector(".name") as HTMLElement)?.innerText.trim() || "",
        startTime:
          (document.querySelector(".startDateWithMinPRice") as HTMLElement)?.innerText.trim() ||
          "",
        status: EventStatus.UPCOMING as const,
        minPrice: (document.querySelector(".minPrice") as HTMLElement)?.innerText.trim() || "",
        location: {
          country: "Egypt",
          address: locationName,
          link: locationLink
        },
      };
    });

    // Assign auto-incremented ID and correct status type
    tazkartiEvents.push({
      ...singleEvent,
      eventId: getNextEventId(),
      status: EventStatus.UPCOMING as const
    });

    await Promise.all([page.goBack({ waitUntil: "networkidle0" })]);

    await new Promise((res) => setTimeout(res, 2000));
    console.log("WAITING FOR PAGE REFRESH");
  }
  events.push(tazkartiEvents);
}

async function scrapeEvents(): Promise<EventDTO[][]> {
  globalEventId = 1; // Reset for each run
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();

  let events: EventDTO[][] = [];
  try {
    await scrapeTicketsMarche(page, events);
  } catch (error) {
    console.error("Error scraping TicketsMarche:", error);
  }

  try {
    await scrapeTazkarti(page, events);
  } catch (error) {
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
