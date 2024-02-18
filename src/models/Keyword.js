const mongoose = require("mongoose");

const { Schema } = mongoose;

const keywordSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    unique: true,
  },
  videos: {
    type: [
      {
        videoId: {
          type: Schema.Types.ObjectId,
          ref: "Video",
        },
        youtubeVideoId: {
          type: String,
          required: true,
        },
        TF: {
          type: Number,
          default: 0,
          required: true,
        },
        titleTF: {
          type: Number,
          default: 0,
          required: true,
        },
        descriptionTF: {
          type: Number,
          default: 0,
          required: true,
        },
        transcriptTF: {
          type: Number,
          default: 0,
          required: true,
        },
        tagTF: {
          type: Number,
          default: 0,
          required: true,
        },
        score: {
          type: mongoose.Decimal128,
          default: 0,
          required: true,
        },
        scoreBM: {
          type: mongoose.Decimal128,
          default: 0,
          required: true,
        },
      },
    ],
    default: [],
    required: true,
  },
  IDF: {
    type: mongoose.Decimal128,
    default: 1,
    required: true,
  },
});

module.exports = mongoose.model("Keyword", keywordSchema);
