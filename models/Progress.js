const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const progressSchema = Schema(
  {
    status: {
      type: String,
      enum: ["completed", "incomplete"],
      required: true,
    },
    date: { type: Date, required: true },
    habit: { type: Schema.Types.ObjectId, required: true, ref: "Habit" },
  },
  { timestamps: true }
);

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
