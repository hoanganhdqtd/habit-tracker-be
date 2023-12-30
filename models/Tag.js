const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tagSchema = Schema(
  {
    title: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    // habits: [{ type: Schema.Types.ObjectId, ref: "Habit" }],
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
