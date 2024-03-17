const dayjs = require("dayjs");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const Habit = require("../models/Habit");

const habitController = {};

// Create a new habit
// POST /habits
habitController.createHabit = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const { name, description, goal, startDate, duration, onWeekdays } = req.body;

  // Validation

  // Process
  const habit = await Habit.create({
    name,
    user: currentUserId,
    goal,
    startDate,
    duration,
  });

  if (description) {
    habit.description = description;
  }

  if (onWeekdays && onWeekdays.length) {
    habit.onWeekdays = onWeekdays.sort((a, b) => a - b);
  } else {
    habit.onWeekdays = Array.from({ length: 7 }, (value, index) => index);
  }
  await habit.save();

  // Send response
  return sendResponse(res, 200, true, habit, null, "Create Habit success");
});

// Get habits of the current user
// GET /habits
habitController.getHabits = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;

  let { page, limit, search, date, tag, sort } = req.query;

  // Validation

  // Process
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  search = search || "";
  tag = tag || "";

  const filterConditions = [
    { user: currentUserId },
    { name: { $regex: search, $options: "i" } },
    { name: { $regex: tag, $options: "i" } },
  ];

  if (date) {
    date = dayjs(date)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0)
      .set("millisecond", 0);

    const weekday = date.get("day");

    filterConditions.push({ startDate: { $lte: date } });
    filterConditions.push({ onWeekdays: weekday });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Habit.countDocuments(filterCriteria);

  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let sortOptions = {};
  if (sort === "latest") {
    sortOptions = { createdAt: -1 };
  } else {
    sortOptions = { name: 1 };
  }

  let habits = await Habit.find(filterCriteria)
    .sort(sortOptions)
    .skip(offset)
    .limit(limit)
    .populate("progressList");

  // Send response
  return sendResponse(
    res,
    200,
    true,
    { habits, date, searchTag: tag, totalPages, count },
    null,
    "Get Habits success"
  );
});

// Get detail of a habit with specific id
// GET /habits/:id
habitController.getSingleHabit = catchAsync(async (req, res, next) => {
  // Get data
  const habitId = req.params.id;
  const currentUserId = req.userId;

  // Validation
  const habit = await Habit.findById(habitId)
    .populate("reminders")
    .populate("progressList")
    .populate("tags")
    .exec();
  if (!habit) {
    throw new AppError(400, "Habit not found", "Get Single Habit error");
  }

  // Process

  // Send response
  return sendResponse(res, 200, true, habit, null, "Get Single Habit success");
});

// Update a habit with specific id
// PUT /habits/:id
habitController.updateSingleHabit = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const habitId = req.params.id;

  // Validation
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new AppError(400, "Habit not found", "Update Single Habit error");
  }

  if (!habit.user.equals(currentUserId)) {
    throw new AppError(
      400,
      "Users can only update their own habits",
      "Update Single Habit error"
    );
  }

  const { name, description, goal, startDate, duration, progress, onWeekdays } =
    req.body;

  if (name) {
    habit.name = name;
  }

  if (description) {
    habit.description = description;
  }

  if (goal) {
    habit.goal = goal;
  }

  if (startDate) {
    habit.startDate = startDate;
  }

  if (duration) {
    habit.duration = duration;
  }

  if (progress) {
    habit.progress = progress;
  }

  if (onWeekdays && onWeekdays.length) {
    habit.onWeekdays = onWeekdays.sort((a, b) => a - b);
  }

  await habit.save();

  // Send response
  return sendResponse(
    res,
    200,
    true,
    habit,
    null,
    "Update Single Habit success"
  );
});

// Delete a habit with specific id
// DELETE /habits/:id
habitController.deleteSingleHabit = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const habitId = req.params.id;

  // Validation
  const habit = await Habit.findOneAndDelete({
    _id: habitId,
    user: currentUserId,
  });
  if (!habit) {
    throw new AppError(
      400,
      "Habit not found or User not authorized",
      "Delete Single Habit error"
    );
  }

  // Process

  // Send response
  return sendResponse(
    res,
    200,
    true,
    habit,
    null,
    "Delete Single Habit success"
  );
});

module.exports = habitController;
