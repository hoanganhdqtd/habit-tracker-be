const express = require("express");
const router = express.Router();

const { body, param } = require("express-validator");

const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

const progressController = require("../controllers/progress.controller");

/**
 * @route POST progress/habit/:habitId
 * @description Create a new daily progress for a specific habit with habitId
 * with { status, date, habitId } and add to the progress list
 * @access Login required
 */
router.post(
  "/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  progressController.addNewDailyProgress
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
  progressController.getSingleHabitProgressList
);

/**
 * @route GET progress/:progressId
 * @description Get a single progress with progressId
 * @access Login required
 */
router.get(
  "/:progressId",
  authentication.loginRequired,
  validators.validate([
    param("progressId").exists().isString().custom(validators.checkObjectId),
  ]),
  progressController.getSingleProgress
);

/**
 * @route PUT progress/habit/:habitId
 * @description Update a daily progress status
 * @access Login required
 */
// router.put(
//   "/:progressId/habit/:habitId",
//   authentication.loginRequired,
//   validators.validate([
//     param("progressId").exists().isString().custom(validators.checkObjectId),
//     param("habitId").exists().isString().custom(validators.checkObjectId),
//   ]),
//   progressController.updateDailyProgress
// );
router.put(
  "/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  progressController.updateDailyProgress
);

module.exports = router;
