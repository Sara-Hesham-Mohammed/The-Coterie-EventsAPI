import puppeteer from "puppeteer";

async function scrapeEvents() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.ticketsmarche.com/Event_filter_grid/Eventlist_filter", { waitUntil: "networkidle2" });

  const events = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".event-card-info")).map(event => ({
      title: event.querySelector(".event-name")?.innerText.trim(),
      date: event.querySelector(".event-date")?.innerText.trim(),
      location: event.querySelector(".event-venue")?.innerText.trim(),
    }));
  });

  console.log(events);
  await browser.close();
  return events;
}

scrapeEvents();

export {scrapeEvents};
