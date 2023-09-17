const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Habit = require("../models/Habit");
const Progress = require("../models/Progress");

const progressController = {};

// Get progress list of a habit
// GET progress/habit/:habitId
progressController.getHabitProgress = catchAsync(async (req, res, next) => {
  // Get data
  const habitId = req.params.habitId;

  // Validation

  // Process
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new AppError(400, "Habit not found", "Get Habit Progress error");
  }

  // Send response
  sendResponse(
    res,
    200,
    true,
    { habit: habitId, progress: habit.progress },
    null,
    "Get Habit Progress success"
  );
});

// Update progress list of a habit
// PUT progress/habit/:habitId
progressController.updateHabitProgress = catchAsync(async (req, res, next) => {
  // Get data
  const habitId = req.params.habitId;

  // Validation
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new AppError(400, "Habit not found", "Update Habit Progress error");
  }

  // Process
  const { status, duration, progressValue, time } = req.body;
  const newProgress = await Progress.create({
    status,
    duration,
    progressValue,
    time,
  });
  habit.progress.push(newProgress);
  await habit.save();

  // Send response
  sendResponse(
    res,
    200,
    true,
    { habit: habitId, progress: habit.progress },
    null,
    "Update Habit Progress success"
  );
});

module.exports = progressController;
