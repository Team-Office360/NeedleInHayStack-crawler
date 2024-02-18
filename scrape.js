const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const chromium = require("@sparticuz/chromium");

const {
  DEFAULT_TAG_NAME_EN,
  DEFAULT_TAG_NAME_KR,
  MORE_BUTTON_SELECTOR,
  SHOW_TRANSCRIPT_SELECTOR,
  SHOW_MORE_BUTTON_SELECTOR,
  LINKS_SELECTOR,
  TITLE_SELECTOR,
  DESCRIPTION_SELECTOR,
  CHANNEL_SELECTOR,
  TRANSCRIPT_SELECTOR,
  META_SELECTOR,
} = require("./src/constants/crawlerConstants");

exports.scrape = async (url) => {
  const videoData = {
    youtubeVideoId: url.split("=")[1],
  };

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

    try {
      await page.goto(url, { waitUntil: "networkidle0" });
      await page.waitForSelector(MORE_BUTTON_SELECTOR);
    } catch (error) {
      console.error(error);
    }

    try {
      await page.$eval(MORE_BUTTON_SELECTOR, (button) => button.click());
      await page.waitForSelector(SHOW_TRANSCRIPT_SELECTOR);
    } catch (error) {
      console.error(error);
    }

    try {
      await page.$eval(SHOW_TRANSCRIPT_SELECTOR, (button) => button.click());
      await page.waitForSelector(TRANSCRIPT_SELECTOR);
      await page.waitForSelector(SHOW_MORE_BUTTON_SELECTOR);
    } catch (error) {
      console.error(error);
    }

    try {
      await page.$eval(SHOW_MORE_BUTTON_SELECTOR, (button) => button.click());
    } catch (error) {
      console.error(error);
    }

    const links = await page.$$eval(LINKS_SELECTOR, (elements) => {
      return Array.from(elements).map((element) => element.href);
    });

    const allForwardLinks = [];

    links.forEach((link) => {
      allForwardLinks.push(link.split("=")[1]);
    });

    videoData.allForwardLinks = allForwardLinks;

    try {
      videoData.title = await page.$eval(
        TITLE_SELECTOR,
        (element) => element.textContent
      );
    } catch (error) {
      console.error(error);
    }

    try {
      videoData.description = await page.$eval(
        DESCRIPTION_SELECTOR,
        (element) => element.textContent
      );
    } catch (error) {
      console.error(error);
    }

    try {
      videoData.channel = await page.$eval(
        CHANNEL_SELECTOR,
        (element) => element.textContent
      );
    } catch (error) {
      console.error(error);
    }

    const transcripts = await page.$$eval(TRANSCRIPT_SELECTOR, (elements) =>
      elements.map((element) => element.textContent)
    );

    const transcriptTimeLines = await page.$$eval(
      "#segments-container > ytd-transcript-segment-renderer .segment-timestamp",
      (elements) => elements.map((element) => element.textContent.trim())
    );

    videoData.transcript = transcripts.join(" ");
    videoData.transcripts = transcripts;
    videoData.transcriptTimeLines = transcriptTimeLines;

    const metaTags = await page.$$eval(META_SELECTOR, (elements) => {
      const result = { thumbnailURL: "", tag: "" };

      elements.forEach((element) => {
        const property = element.getAttribute("property");
        const name = element.getAttribute("name");

        if (property === "og:image") {
          result.thumbnailURL = element.getAttribute("content");
        }

        if (name === "keywords") {
          result.tag = element.getAttribute("content");
        }
      });

      return result;
    });

    videoData.thumbnailURL = metaTags.thumbnailURL;
    videoData.tag = metaTags.tag;

    if (
      videoData.tag === DEFAULT_TAG_NAME_EN ||
      videoData.tag === DEFAULT_TAG_NAME_KR
    ) {
      videoData.tag = "";
    }

    const pages = await browser.pages();

    await Promise.all(pages.map(async (page) => page.close()));

    await browser.close();

    return videoData;
  } catch (error) {
    console.log("error at scrape", error.message);
  }
};
