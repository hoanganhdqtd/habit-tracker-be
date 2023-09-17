const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const Habit = require("../models/Habit");
const Reminder = require("../models/Reminder");

const habitController = {};

// Create a new habit
// POST /habits
habitController.createHabit = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const {
    name,
    description,
    goal,
    startDate,
    duration,
    onWeekdays,
    reminders,
  } = req.body;

  // Validation

  // Process

  // create reminders
  // const habitReminders = reminders.map(async (reminder) => {
  //   const newReminder = await Reminder.create({
  //     reminderFrequency: reminder.reminderFrequency,
  //     time: reminder.time,
  //     onWeekdays: reminder.onWeekdays,
  //     status: reminder.status,
  //   });
  //   return newReminder;
  // });

  let habit = await Habit.create({
    name,
    user: currentUserId,
    // description,
    goal,
    startDate,
    duration,
    // onWeekdays,
    // reminders: habitReminders,
  });

  // Send response
  return sendResponse(res, 200, true, habit, null, "Create Habit success");
});

// Get habits of the current user
// GET /habits
habitController.getHabits = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;

  let { page, limit, search, date } = req.query;

  // Validation

  // Process
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  search = search || "";

  const filterConditions = [
    { user: currentUserId },
    { name: { $regex: search } },
    {},
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Habit.countDocuments(filterCriteria);

  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let habits = await Habit.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  // Send response
  return sendResponse(
    res,
    200,
    true,
    { habits, totalPages, count },
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
  let habit = await Habit.findById(habitId);
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
  let habit = await Habit.findById(habitId);
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

  // Process
  const allows = [
    "name",
    "description",
    "goal",
    "startDate",
    "duration",
    "progress",
    "onWeekdays",
    "reminders",
  ];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      habit[field] = req.body[field];
    }
  });
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
