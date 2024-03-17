const dayjs = require("dayjs");

const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Habit = require("../models/Habit");
const Progress = require("../models/Progress");

const progressController = {};

// Get progress list of a habit
// GET progress/habit/:habitId?date=${date}
progressController.getSingleHabitProgressList = catchAsync(
  async (req, res, next) => {
    // Get data
    const habitId = req.params.habitId;
    let { date } = req.query;

    // Validation

    // Process
    if (!date) {
      const habit = await Habit.findById(habitId).populate("progressList");
      if (!habit) {
        throw new AppError(
          400,
          "Habit not found",
          "Get Single Habit Progress List error"
        );
      }

      // Send response
      sendResponse(
        res,
        200,
        true,
        { habitId, progressList: habit.progressList },
        null,
        "Get Single Habit Progress List success"
      );
    } else {
      date = dayjs(date)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .set("millisecond", 0);
      const progressList = await Progress.find({ habit: habitId, date });

      // Send response
      sendResponse(
        res,
        200,
        true,
        { habitId, progressList },
        null,
        "Get Single Habit Progress By Date success"
      );
    }
  }
);

// Create new daily progress and add to the habit's progress list
// POST progress/habit/:habitId
progressController.addNewDailyProgress = catchAsync(async (req, res, next) => {
  // Get data
  const { habitId } = req.params;

  // Validation
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new AppError(400, "Habit not found", "Add New Daily Progress error");
  }

  // Process
  const { status, date } = req.body;
  let newProgress = await Progress.create({
    status,
    date,
    habit: habitId,
  });

  habit.progressList.push(newProgress._id);

  await habit.save();

  // Send response
  sendResponse(
    res,
    200,
    true,
    { habit: habitId, progress: newProgress },
    null,
    "Add New Daily Progress success"
  );
});

// Get a single progress with progressId
// GET /progress/:progressId
progressController.getSingleProgress = catchAsync(async (req, res, next) => {
  // Get data
  const { progressId } = req.params;

  // Validation

  // Process
  const progress = await Progress.findById(progressId);

  if (!progress) {
    throw new AppError(400, "Progress not found", "Get Single Progress error");
  }

  // Send response
  sendResponse(
    res,
    200,
    true,
    progress,
    null,
    "Create New Daily Progress success"
  );
});

// Update daily progress
// PUT progress/habit/:habitId
progressController.updateDailyProgress = catchAsync(async (req, res, next) => {
  // Get data
  const { habitId } = req.params;
  const { date, status } = req.body;

  // Validation
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new AppError(400, "Habit not found", "Update Daily Progress error");
  }

  let progress = await Progress.findOne({ habit: habitId, date });

  // Process
  if (!progress) {
    progress = await Progress.create({
      status,
      date,
      habit: habitId,
    });
    habit.progressList.push(progress._id);
    await habit.save();
  } else {
    progress.status = status;
    await progress.save();
  }

  // Send response
  return sendResponse(
    res,
    200,
    true,
    { name: habit.name, progress },
    null,
    "Update Daily Progress success"
  );
});

module.exports = progressController;
