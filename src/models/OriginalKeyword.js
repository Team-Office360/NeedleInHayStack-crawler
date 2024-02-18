const mongoose = require("mongoose");

const originalKeywordSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  value: {
    type: [String],
    unique: true,
  },
});

module.exports = mongoose.model("OriginalKeyword", originalKeywordSchema);
