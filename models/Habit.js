const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const habitSchema = Schema(
  {
    name: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    description: { type: String },
    goal: { type: String, required: true },
    startDate: { type: Date, require: true },
    progressList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Progress",
      },
    ],
    duration: { type: Number, required: true },
    onWeekdays: [{ type: Number, min: 0, max: 6 }],
    reminders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reminder",
      },
    ],
  },
  { timestamps: true }
);

const Habit = mongoose.model("Habit", habitSchema);

module.exports = Habit;
