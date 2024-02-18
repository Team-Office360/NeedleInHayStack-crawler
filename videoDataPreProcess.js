const analyzeText = require("./src/utils/analyzeText");

exports.videoDataPreProcess = function (videoData) {
  const fullText = `${videoData.title} ${videoData.description} ${videoData.channel} ${videoData.transcript} ${videoData.tag}`;
  const tokens = analyzeText(fullText);

  videoData.documentLength = tokens.length;
  videoData.titleLength = analyzeText(
    `${videoData.title} ${videoData.channel}`
  ).length;
  videoData.descriptionLength = analyzeText(videoData.description).length;
  videoData.transcriptLength = analyzeText(videoData.transcript).length;
  videoData.tagLength = analyzeText(videoData.tag).length;

  return videoData;
};
