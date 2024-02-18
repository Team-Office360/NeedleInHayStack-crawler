const math = require("mathjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongooseLoader = require("../loaders/mongoose");

const {
  DAMPING_FACTOR,
  MAX_ITERATIONS,
} = require("../constants/rankingConstants");

const Video = require("../models/Video");

async function setForwardLinks() {
  try {
    const videos = await Video.find();

    const videosPromises = videos.map(async (video) => {
      const forwardLinks = [];

      await Promise.all(
        video.allForwardLinks.map(async (forwardLink) => {
          const forwardVideo = await Video.findOne({
            youtubeVideoId: forwardLink,
          });

          if (forwardVideo && forwardLink !== video.youtubeVideoId) {
            forwardLinks.push(forwardLink);
          }
        }),
      );

      await Video.findOneAndUpdate(
        { youtubeVideoId: video.youtubeVideoId },
        { forwardLinks },
      );
    });

    await Promise.all(videosPromises);
  } catch (error) {
    console.error(error);
  }
}

async function calculatePageRank() {
  const adjacencyMatrix = [];
  const videos = await Video.find().lean();
  const videosIds = videos.map((video) => video.youtubeVideoId);
  const numPages = videos.length;

  await Promise.all(
    videos.map(async (video) => {
      const arr = new Array(numPages).fill(0);

      video.forwardLinks.forEach((forwardLink) => {
        arr[videosIds.indexOf(forwardLink)] = 1;
      });

      adjacencyMatrix.push(arr);
    }),
  );

  const teleportationProb = (1 - DAMPING_FACTOR) / numPages;

  let pageRank = math.ones(numPages).map((val) => val / numPages);
  const outDegree = adjacencyMatrix.map((row) => math.sum(row));
  const stochasticMatrix = adjacencyMatrix.map((row, i) =>
    row.map((val) => val / (outDegree[i] || numPages)),
  );

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const prevPageRank = pageRank;

    pageRank = math.add(
      math.multiply(DAMPING_FACTOR, math.multiply(pageRank, stochasticMatrix)),
      math.multiply(teleportationProb, math.sum(prevPageRank)),
    );
  }

  await Promise.all(
    videos.map(async (video, index) => {
      const pageRankScore = pageRank.toArray()[index];

      await Video.findOneAndUpdate(
        { youtubeVideoId: video.youtubeVideoId },
        { pageRankScore },
      );
    }),
  );
}

async function setPageRank() {
  await mongooseLoader();
  console.log("Start calculating page rank");

  await setForwardLinks();
  console.log("set forward links");

  await calculatePageRank();

  console.log("Finish calculating page rank");
}

setPageRank();
