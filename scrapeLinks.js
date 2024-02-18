const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const chromium = require("@sparticuz/chromium");

const Video = require("./src/models/Video");

const { LINKS_SELECTOR } = require("./src/constants/crawlerConstants");

exports.scrapeLinks = async (url) => {
  const linksQueue = [];

  try {
    puppeteerExtra.use(stealthPlugin());

    const browser = await puppeteerExtra.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle0" });

    const links = await page.$$eval(LINKS_SELECTOR, (elements) => {
      return Array.from(elements).map((element) => element.href);
    });

    const linksPromises = links.map(async (link) => {
      const isVideoExist = await Video.exists({
        youtubeVideoId: link.split("=")[1],
      });
  
      if (!isVideoExist) {
        linksQueue.push(link.split("=")[1]);
      }
    });

    await Promise.all(linksPromises);
    
    const pages = await browser.pages();

    await Promise.all(pages.map(async (page) => page.close()));

    await browser.close();

    return linksQueue;
  } catch (error) {
    console.log("error at scrape", error.message);
  }
}