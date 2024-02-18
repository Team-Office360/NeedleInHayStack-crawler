const { scrape } = require("./scrape.js");

exports.handler = async (event, context, callback) => {
  try {
    const body = JSON.parse(event.body);
    const { videoId } = body;

    const videoData = await scrape(
      `https://www.youtube.com/watch?v=${videoId}`
    );

    return { statusCode: 200, body: JSON.stringify(videoData) };
  } catch (error) {
    console.log("error at index.js", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
