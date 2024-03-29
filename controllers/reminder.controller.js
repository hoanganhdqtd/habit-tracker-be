const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const Habit = require("../models/Habit");
const Reminder = require("../models/Reminder");

const reminderController = {};

// Create a new reminder for a habit that has a specific id
// POST /reminders/habit/:habitId
reminderController.createHabitReminder = catchAsync(async (req, res, next) => {
  // Get data
  const habitId = req.params.habitId;
  const { time, onWeekdays, startDate, status } = req.body;

  // Validation

  // Process
  const newReminder = await Reminder.create({
    time,
    startDate,
    status,
  });

  // check if onWeekdays is input by the user
  if (onWeekdays && onWeekdays.length) {
    newReminder.onWeekdays = onWeekdays.sort((a, b) => a - b);
  } else {
    newReminder.onWeekdays = Array.from({ length: 7 }, (value, index) => index);
  }

  await newReminder.save();

  let habit = await Habit.findById(habitId);

  habit.reminders.push(newReminder._id);
  await habit.save();

  habit = await habit.populate("reminders");

  // Send response
  return sendResponse(res, 200, true, habit, null, "Create Reminder success");
});

// Get a reminder by Id
// GET /reminders/:reminderId
reminderController.getSingleReminder = catchAsync(async (req, res, next) => {
  // Get data
  const reminderId = req.params.reminderId;

  // Validation

  // Processing
  const reminder = await Reminder.findById(reminderId);
  if (!reminder) {
    throw new AppError(400, "Reminder not found", "Get Single Reminder error");
  }

  // Send response
  return sendResponse(
    res,
    200,
    true,
    reminder,
    null,
    "Get Single Reminder success"
  );
});

// Update a reminder
// PUT /reminders/:reminderId
reminderController.updateSingleReminder = catchAsync(async (req, res, next) => {
  // Get data
  const { reminderId } = req.params;

  // Validation

  // Process
  const reminder = await Reminder.findById(reminderId);
  const { time, startDate, onWeekdays, status } = req.body;
  if (startDate) {
    reminder.startDate = startDate;
  }
  if (time) {
    reminder.time = time;
  }
  if (onWeekdays) {
    reminder.onWeekdays = onWeekdays;
  }
  if (status) {
    reminder.status = status;
  }
  await reminder.save();

  // Send response
  return sendResponse(
    res,
    200,
    true,
    reminder,
    null,
    "Update Single Reminder success"
  );
});

// Delete a reminder
// DELETE /reminders/:reminderId/habit/:habitId/
reminderController.deleteHabitSingleReminder = catchAsync(
  async (req, res, next) => {
    // Get data
    const { habitId, reminderId } = req.params;

    // Validation
    const habit = await Habit.findById(habitId);
    if (!habit) {
      throw new AppError(
        400,
        "Habit not found",
        "Delete Habit Single Reminder error"
      );
    }

    const reminderIndex = habit.reminders.indexOf(reminderId);

    if (reminderIndex === -1) {
      throw new AppError(
        400,
        "Reminder not found",
        "Delete Habit Single Reminder error"
      );
    }

    // Process
    const reminder = await Reminder.findByIdAndDelete(reminderId);

    if (!reminder) {
      throw new AppError(
        400,
        "Reminder not found",
        "Delete Habit Single Reminder error"
      );
    }

    habit.reminders = habit.reminders.filter(
      (elementId) => elementId !== reminderId
    );

    await habit.save();

    // Send response
    return sendResponse(
      res,
      200,
      true,
      reminder,
      null,
      "Delete Habit Single Reminder success"
    );
  }
);

// Delete all reminders for a habit
// DELETE /reminders/habit/:habitId
reminderController.deleteHabitAllReminders = catchAsync(
  async (req, res, next) => {
    // Get data
    const habitId = req.params.habitId;
    const habit = await Habit.findById(habitId);

    // Validation

    // Process
    const reminders = habit.reminders.map((reminder) => reminder);

    habit.reminders.length = 0;
    habit.save();

    // Send response
    return sendResponse(
      res,
      200,
      true,
      reminders,
      null,
      "Delete Habit's All Reminders success"
    );
  }
);

module.exports = reminderController;
