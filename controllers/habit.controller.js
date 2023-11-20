const dayjs = require("dayjs");
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

  if (onWeekdays && onWeekdays.length) {
    console.log("onWeekdays:", onWeekdays);
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

  let { page, limit, search, date } = req.query;

  // Validation

  // Process
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  search = search || "";
  let nextDate;

  const filterConditions = [
    { user: currentUserId },
    { name: { $regex: search } },
    // { startDate: { $lte: date } },
  ];

  if (date) {
    // date = new Date(date);

    nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    date = dayjs(date)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0)
      .set("millisecond", 0);

    const weekday = date.get("day");

    nextDate = dayjs(nextDate)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0)
      .set("millisecond", 0);

    filterConditions.push({ startDate: { $lte: date } });
    filterConditions.push({ onWeekdays: weekday });
  }

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

  console.log("updateSingleHabit be");

  // Process
  // const allows = [
  //   "name",
  //   "description",
  //   "goal",
  //   "startDate",
  //   "duration",
  //   "progress",
  //   "onWeekdays",
  //   "reminders",
  // ];

  // allows.forEach((field) => {
  //   console.log(`188 req.body.${field}: ${req.body[field]}`);
  //   if (!req.body[field]) {
  //     req.body[field] = habit[field];
  //   }
  //   console.log(`192 req.body.${field}: ${req.body[field]}`);
  // });

  // console.log("195 req.body:", req.body);

  // allows.forEach((field) => {
  //   if (req.body[field] !== undefined) {
  //     console.log(`199 req.body.${field}: ${req.body[field]}`);
  //     if (["onWeekdays", "progress", "reminders"].includes(field)) {
  //       if (!req.body[field].length) {
  //         console.log(`214 habit.${field}: ${habit[field]}`);
  //         req.body[field] = habit[field];
  //       }
  //     }
  //   }
  //   habit[field] = req.body[field];
  // });
  // console.log(`209 habit: ${habit}`);

  console.log("211 req.body:", req.body);
  const { name, description, goal, duration, progress, onWeekdays, reminders } =
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
