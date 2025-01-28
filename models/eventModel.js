const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true},
    date: { type: Date, required: true},
    location: { type: String, required: true },
    participants: [ {type: String, required: false},],
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("event", eventSchema);

module.exports = Event;