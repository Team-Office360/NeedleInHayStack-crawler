const { startSession } = require("mongoose");
const mongooseLoader = require("./src/loaders/mongoose");

const { videoDataPreProcess } = require("./videoDataPreProcess");
const insertIntoDB = require("./src/crawler/insertIntoDB");

exports.handler = async (event, context, callback) => {
  try {
    const body = JSON.parse(event.body);
    const { videoData } = body;
    const processedVideoData = videoDataPreProcess(videoData);

    await mongooseLoader();
    const session = await startSession();

    try {
      session.startTransaction();

      await insertIntoDB(processedVideoData, session);
      await session.commitTransaction();
      console.log(`Inserted ${processedVideoData.youtubeVideoId} into DB.`);
    } catch (error) {
      console.error(error.message);
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        result: "ok",
        message: "autoCrawling succeed",
      }),
    };
  } catch (error) {
    console.log("error at index.js", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ result: "ng", message: error.message }),
    };
  }
};
