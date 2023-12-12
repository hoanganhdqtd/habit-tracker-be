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
    { habitId, progress: habit.progress },
    null,
    "Get Habit Progress success"
  );
});

// Add new progress to the progress list of a habit
// PUT progress/habit/:habitId
progressController.addHabitProgress = catchAsync(async (req, res, next) => {
  // Get data
  const habitId = req.params.habitId;

  // Validation
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new AppError(400, "Habit not found", "Add Habit Progress error");
  }

  // Process
  // const { status, duration, progressValue, time } = req.body;
  const { status, date } = req.body;
  const newProgress = await Progress.create({
    status,
    date,
  });
  habit.progress.push(newProgress._id);
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

// Create new daily progress
// POST progress/habit/:habitId
progressController.createNewDailyProgress = catchAsync(
  async (req, res, next) => {
    // Get data
    const { habitId } = req.params;

    // Validation
    const habit = await Habit.findById(habitId);
    if (!habit) {
      throw new AppError(400, "Habit not found", "Add Habit Progress error");
    }

    // Process
    const { status, date } = req.body;
    let newProgress = await Progress.create({
      status,
      date,
      // habitId
    });

    habit.progress.push(newProgress._id);

    await habit.save();

    // Send response
    sendResponse(
      res,
      200,
      true,
      { habit: habitId, progress: newProgress },
      null,
      "Create New Daily Progress success"
    );
  }
);

// Update daily progress
progressController.updateDailyProgress = catchAsync(async (req, res, next) => {
  // Get data
  const { progressId } = req.params;

  // const habitId = req.params.habitId;

  // Validation
  let progress = await Progress.findById(progressId);
  if (!progress) {
    throw new AppError(
      400,
      "Progress not found",
      "Update Daily Progress error"
    );
  }

  // Process
  const { date, status } = req.body;
  progress.status = status;

  await progress.save();

  // Send response
  return sendResponse(
    res,
    200,
    true,
    progress,
    null,
    "Update Daily Progress success"
  );
});

module.exports = progressController;
