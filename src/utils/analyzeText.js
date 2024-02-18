const { STOP_WORDS } = require("../constants/wordData");

function analyzeText(text) {
  text = text.replace(/(?:https?|ftp):\/\/[\w\S]+/g, "");
  text = text.replace(/[^a-zA-Z\s]/g, "");
  text = text.replace(/\s+/g, " ");
  text = text.toLowerCase();

  const tokens = text
    .split(" ")
    .filter((word) => !STOP_WORDS.includes(word.toLowerCase()));

  return tokens;
}

module.exports = analyzeText;
