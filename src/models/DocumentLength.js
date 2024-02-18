const mongoose = require("mongoose");

const documentLengthSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  documentLength: {
    type: Number,
    required: true,
  },
  titleLength: {
    type: Number,
    required: true,
  },
  descriptionLength: {
    type: Number,
    required: true,
  },
  transcriptLength: {
    type: Number,
    required: true,
  },
  tagLength: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("DocumentLength", documentLengthSchema);
