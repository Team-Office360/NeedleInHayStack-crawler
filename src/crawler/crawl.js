const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { startSession } = require("mongoose");
const puppeteer = require("puppeteer");
const Video = require("../models/Video");

const analyzeText = require("../utils/analyzeText");
const insertIntoDB = require("./insertIntoDB");

const {
  DEFAULT_TAG_NAME_EN,
  DEFAULT_TAG_NAME_KR,
  HTML_ENTRY_URL,
  CSS_ENTRY_URL,
  JAVASCRIPT_ENTRY_URL,
  MORE_BUTTON_SELECTOR,
  SHOW_TRANSCRIPT_SELECTOR,
  SHOW_MORE_BUTTON_SELECTOR,
  LINKS_SELECTOR,
  TITLE_SELECTOR,
  DESCRIPTION_SELECTOR,
  CHANNEL_SELECTOR,
  TRANSCRIPT_SELECTOR,
  META_SELECTOR,
} = require("../constants/crawlerConstants");

async function crawl(url) {
  console.log("Start Crawling");
  const newLinksQueue = [];
  const newVideoObject = {
    youtubeVideoId: url.split("=")[1],
  };

  const browser = await puppeteer.launch({
    headless: "new",
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

  const linksPromises = links.slice(0, 5).map(async (link) => {
    const videoData = await Video.findOne({
      youtubeVideoId: link.split("=")[1],
    }).lean();

    if (!videoData) {
      newLinksQueue.push(link);
    }
  });

  await Promise.all(linksPromises);

  links.forEach((link) => {
    allForwardLinks.push(link.split("=")[1]);
  });

  newVideoObject.allForwardLinks = allForwardLinks;

  try {
    newVideoObject.title = await page.$eval(
      TITLE_SELECTOR,
      (element) => element.textContent,
    );
  } catch (error) {
    console.error(error);
  }

  try {
    newVideoObject.description = await page.$eval(
      DESCRIPTION_SELECTOR,
      (element) => element.textContent,
    );
  } catch (error) {
    console.error(error);
  }

  try {
    newVideoObject.channel = await page.$eval(
      CHANNEL_SELECTOR,
      (element) => element.textContent,
    );
  } catch (error) {
    console.error(error);
  }

  const transcripts = await page.$$eval(TRANSCRIPT_SELECTOR, (elements) =>
    elements.map((element) => element.textContent),
  );

  const transcriptTimeLines = await page.$$eval(
    "#segments-container > ytd-transcript-segment-renderer .segment-timestamp",
    (elements) => elements.map((element) => element.textContent.trim()),
  );

  newVideoObject.transcript = transcripts.join(" ");

  newVideoObject.transcripts = transcripts;
  newVideoObject.transcriptTimeLines = transcriptTimeLines;

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

  newVideoObject.thumbnailURL = metaTags.thumbnailURL;
  newVideoObject.tag = metaTags.tag;

  if (
    newVideoObject.tag === DEFAULT_TAG_NAME_EN ||
    newVideoObject.tag === DEFAULT_TAG_NAME_KR
  ) {
    newVideoObject.tag = "";
  }

  const fullText = `${newVideoObject.title} ${newVideoObject.description} ${newVideoObject.channel} ${newVideoObject.transcript} ${newVideoObject.tag}`;
  const tokens = analyzeText(fullText);

  newVideoObject.documentLength = tokens.length;
  newVideoObject.titleLength = analyzeText(
    `${newVideoObject.title} ${newVideoObject.channel}`,
  ).length;
  newVideoObject.descriptionLength = analyzeText(
    newVideoObject.description,
  ).length;
  newVideoObject.transcriptLength = analyzeText(
    newVideoObject.transcript,
  ).length;
  newVideoObject.tagLength = analyzeText(newVideoObject.tag).length;

  await browser.close();

  const session = await startSession();

  try {
    session.startTransaction();

    await insertIntoDB(newVideoObject, session);
    await session.commitTransaction();
    console.log(`Inserted ${url} into DB.`);
  } catch (error) {
    console.error(error.message);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }

  return { newVideoObject, newLinksQueue };
}

module.exports = { crawl };
