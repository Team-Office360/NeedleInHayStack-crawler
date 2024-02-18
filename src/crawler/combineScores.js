const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongooseLoader = require("../loaders/mongoose");

const Keyword = require("../models/Keyword");
const Video = require("../models/Video");

async function combinePageRankAndBM25() {
  console.log("Start Ranking for all keywords");

  const keywords = await Keyword.find().populate("videos.videoId");

  try {
    await Promise.all(
      keywords.map(async (keyword) => {
        keyword.videos.forEach((video) => {
          video.score =
            parseFloat(video.scoreBM, 10) *
            (1 + parseFloat(video.videoId.pageRankScore, 10));
        });

        keyword.videos = keyword.videos.sort(
          (videoOne, videoTwo) => videoTwo.score - videoOne.score,
        );

        console.log(keyword.text);
        await keyword.save();
      }),
    );
  } catch (error) {
    console.error(error);
  }
  console.log("Finish Ranking for all keywords");
}

async function combineScores() {
  await mongooseLoader();
  const start = Date.now();
  await combinePageRankAndBM25();
  console.log(Date.now() - start);
}

combineScores();
