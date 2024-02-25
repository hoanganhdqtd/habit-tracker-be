var express = require("express");
var router = express.Router();

const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

const reminderController = require("../controllers/reminder.controller");

/**
 * @route POST /reminders/habit/:habitId
 * @description Create a new reminder for a habit that has a specific id
 * @body { reminderFrequency, onWeekdays, time, status }
 * @access Login required
 */
router.post(
  "/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
    body("time", "Missing time").exists().bail().notEmpty(),
    body("status", "Missing status").exists().bail().notEmpty(),
  ]),
  reminderController.createHabitReminder
);

/**
 * @route GET /reminders/:reminderId
 * @description Get a reminder with reminderId
 * @access Login required
 */
router.get(
  "/:reminderId",
  authentication.loginRequired,
  validators.validate([
    param("reminderId").exists().isString().custom(validators.checkObjectId),
  ]),
  reminderController.getSingleReminder
);

/**
 * @route PUT /reminders/:reminderId
 * @description Update a reminder with reminderId for a habit
 * @body { reminderFrequency, onWeekdays, time, status }
 * @access Login required
 */
router.put(
  "/:reminderId",
  authentication.loginRequired,
  validators.validate([
    param("reminderId").exists().isString().custom(validators.checkObjectId),
  ]),
  reminderController.updateSingleReminder
);

/**
 * @route DELETE /reminders/:reminderId/habit/:habitId/
 * @description Delete a reminder with reminderId from a habit's reminders list with habitId
 * @access Login required
 */
router.delete(
  "/:reminderId/habit/:habitId/",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
    param("reminderId").exists().isString().custom(validators.checkObjectId),
  ]),
  reminderController.deleteHabitSingleReminder
);

/**
 * @route DELETE /reminders/habit/:habitId
 * @description Delete all reminders for a habit with ID of habitID
 * @access Login required
 */
router.delete(
  "/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  reminderController.deleteHabitAllReminders
);

module.exports = router;
