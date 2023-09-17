const express = require("express");
const router = express.Router();

const { body, param } = require("express-validator");

const habitController = require("../controllers/habit.controller");

const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route POST /habits
 * @description create a new habit
 * @body {  }
 * @access Public
 */

// the controllers still run if validators.validate() is not executed
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("name", "Invalid name").exists().bail().trim().notEmpty(),
    body("goal", "Invalid goal").exists().trim().notEmpty(),
    body("startDate", "Invalid startDate").exists().notEmpty(),
    body("duration", "Invalid duration").exists().notEmpty(),
  ]),
  habitController.createHabit
);

/**
 * @route GET /habits
 * @description Get current user's habits, filtered by day,
 * status, or searching by name
 * @access Login required
 */
router.get("/", authentication.loginRequired, habitController.getHabits);

/**
 * @route GET /habits/:id
 * @description Get detail of the habit with id
 * @access Login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  habitController.getSingleHabit
);

/**
 * @route PUT /habits/:id
 * @description update a specific habit
 * @body { name, description, goal, startDate, progress, duration, weekdays, reminders }
 * @access Login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  habitController.updateSingleHabit
);

/**
 * @route DELETE /habits/:id
 * @description delete a specific habit
 * @access Login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  habitController.deleteSingleHabit
);

module.exports = router;
