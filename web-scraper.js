import puppeteer from "puppeteer";

async function scrapeTicketsMarche(page, events) {
  await page.goto(
    "https://www.ticketsmarche.com/Event_filter_grid/Eventlist_filter",
    { waitUntil: "networkidle2" }
  );

  const ticketsMarcheEvents = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".event-card-info")).map(
      (event) => ({
        title: event.querySelector(".event-name")?.innerText.trim(),
        date: event.querySelector(".event-date")?.innerText.trim(),
        location: event.querySelector(".event-venue")?.innerText.trim(),
      })
    );
  });

  console.log(ticketsMarcheEvents);
  events.push(ticketsMarcheEvents);
}

async function scrapeTazkarti(page, events) {
  let tazkartiEvents = [];

  await page.goto("https://www.tazkarti.com/#/events/categories", {
    waitUntil: "networkidle2",
  });

  // Wait for cards to load

  await page.waitForSelector("div.ng-star-inserted");

  // Count how many cards there are
  const cardCount = await page.$$eval(
    "div.ng-star-inserted",
    (cards) => cards.length
  );

  for (let i = 0; i < cardCount; i++) {
    // Re-select all cards because the DOM is refreshed after navigation
    const cards = await page.$$("div.ng-star-inserted");
    console.log(`CARDS: ${cards}`);

    if (!cards[i]) {
      console.warn(`Card ${i} is undefined`);
      continue;
    } else {
      console.log(`Card ${i} found`);
    }
    const link = await cards[i].$("a.eventCategory");
    // Click on the i-th card
    await Promise.all([
      link.click(),
      page.waitForNavigation({ waitUntil: "networkidle0" }), // wait for new page to load
    ]);

    await new Promise((res) => setTimeout(res, 2000));
    console.log("WAITING TO START SCRAPING");

    // Scrape data
    const singleEvent = await page.evaluate(() => {
      const anchors = Array.from(
        document.querySelectorAll('a[target="_blank"]')
      );
      const mapsAnchor = anchors.find((a) =>
        a.href.includes("google.com/maps")
      );
      const locationLink = mapsAnchor?.href || "";
      const locationName = document.querySelector('.venuLinkgooglemap')?.innerText.trim() || "NOT FOUND";

      return {
        title: document.querySelector(".name")?.innerText.trim() || "",
        date:
          document.querySelector(".startDateWithMinPRice")?.innerText.trim() ||
          "",
        minPrice: document.querySelector(".minPrice")?.innerText.trim() || "",
        location: [locationName, locationLink],
       
      };
    });

    tazkartiEvents.push(singleEvent);

    // Go back to the main page
    await Promise.all([page.goBack({ waitUntil: "networkidle0" })]);

    await new Promise((res) => setTimeout(res, 2000));
    console.log("WAITING FOR PAGE REFRESH");
  }

  tazkartiEvents.forEach((event, index) => {
    console.log(
      `TAZKARTI EVENT ${index + 1}: ${JSON.stringify(event, null, 2)}`
    );
  });

  events.push(tazkartiEvents);
}

async function scrapeEvents() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let events = [];
  // try {
  //   await scrapeTicketsMarche(page, events);
  // } catch (error) {
  //   console.error("Error scraping TicketsMarche:", error);
  // }

  try {
    await scrapeTazkarti(page, events);
  } catch (error) {
    console.error("Error scraping Tazkarti:", error);
  }
  await browser.close();
  return events;
}

scrapeEvents(); //run this ever x amt of time automatically and replace the list that's in the DB, maybe archive the old list

export { scrapeEvents };
