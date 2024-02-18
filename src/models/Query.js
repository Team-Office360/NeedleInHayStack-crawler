const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
    required: true,
  },
});

module.exports = mongoose.model("Query", querySchema);
