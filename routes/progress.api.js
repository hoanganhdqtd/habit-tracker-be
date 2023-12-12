const express = require("express");
const router = express.Router();

const { body, param } = require("express-validator");

const progressController = require("../controllers/progress.controller");

const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

/**
 * @route POST progress/habit/:habitId
 * @description Create a new daily progress for a specific habit with habitId
 * with { status, date }
 * @access Login required
 */
router.post(
  "/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  progressController.createNewDailyProgress
);

/**
 * @route GET progress/habit/:habitId
 * @description Get progress list of a specific habit with habitId
 * @access Login required
 */
router.get(
  "/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  progressController.getHabitProgress
);

/**
 * @route PUT progress/habit/:habitId
 * @description Add new progress to the progress list of a habit
 * with habitId by {status, date}
 * @access Login required
 */
router.put(
  "/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  progressController.addHabitProgress
);

/**
 * @route PUT progress/:progressId/habit/:habitId
 * @description Update a daily progress
 * @access Login required
 */
router.put(
  "/:progressId/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("progressId").exists().isString().custom(validators.checkObjectId),
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  progressController.updateDailyProgress
);

module.exports = router;
