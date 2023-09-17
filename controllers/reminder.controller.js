const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const Habit = require("../models/Habit");
const Reminder = require("../models/Reminder");

const reminderController = {};

// Create a new reminder for a habit that has a specific id
// POST /reminders/habit/:habitId
reminderController.createHabitReminder = catchAsync(async (req, res, next) => {
  // Get data
  const habitId = req.params.habitId;
  const { reminderFrequency, time, onWeekdays, startDate, status } = req.body;

  // Validation

  // Process
  const newReminder = await Reminder.create({
    reminderFrequency,
    time,
    // onWeekdays,
    startDate,
    status,
  });

  if (onWeekdays) {
    newReminder.onWeekdays = onWeekdays;
    await newReminder.save();
  }

  if (status) {
    newReminder.status = status;
    await newReminder.save();
  }

  let habit = await Habit.findById(habitId);

  habit.reminders.push(newReminder._id);
  await habit.save();

  habit = await habit.populate("reminders");

  // Send response
  return sendResponse(res, 200, true, habit, null, "Create Reminder success");
});

// Update a reminder
// PUT /reminders/:reminderId
reminderController.updateHabitReminder = catchAsync(async (req, res, next) => {
  // Get data
  const { reminderId } = req.params;

  // Validation

  // Process
  let reminder = await Reminder.findById(reminderId);
  const { reminderFrequency, time, onWeekdays, status } = req.body;
  if (reminderFrequency) {
    reminder.reminderFrequency = reminderFrequency;
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
    "Update Reminder success"
  );
});

// Delete a reminder
// DELETE /reminders/:reminderId/habit/:habitId/
reminderController.deleteHabitSingleReminder = catchAsync(
  async (req, res, next) => {
    // Get data
    const { habitId, reminderId } = req.params;

    // Validation
    let habit = await Habit.findById(habitId);
    if (!habit) {
      throw new AppError(400, "Habit not found", "Delete Habit Reminder error");
    }

    const reminderIndex = habit.reminders.indexOf(reminderId);

    if (reminderIndex === -1) {
      throw new AppError(
        400,
        "Reminder not found",
        "Delete Habit Reminder error"
      );
    }

    // Process
    let reminder = await Reminder.findByIdAndDelete(reminderId);

    if (!reminder) {
      throw new AppError(
        400,
        "Reminder not found",
        "Delete Habit Reminder error"
      );
    }

    // remove reminderId from habit's reminders array
    habit.reminders.splice(reminderIndex, 1);
    await habit.save();

    // Send response
    return sendResponse(
      res,
      200,
      true,
      reminder,
      null,
      "Delete Habit Reminder success"
    );
  }
);

// Delete all reminders for a habit
// DELETE /reminders/habit/:habitId
reminderController.deleteHabitAllReminders = catchAsync(
  async (req, res, next) => {
    // Get data
    const habitId = req.params.habitId;
    let habit = await Habit.findById(habitId);

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
