const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reminderSchema = Schema(
  {
    time: { type: Date, required: true },
    startDate: { type: Date, required: true },
    onWeekdays: [{ type: Number, min: 0, max: 6 }],
    status: {
      type: String,
      enum: ["ongoing", "pause"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;
