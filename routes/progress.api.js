const express = require("express");
const router = express.Router();

const { body, param } = require("express-validator");

const progressController = require("../controllers/progress.controller");

const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

/**
 * @route GET progress/habit/:habitId
 * @description Get progress of a specific habit with habitId
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
 * @description Update progress of a specific habit with habitId by {status, duration, progressValue, time}
 * @access Login required
 */
router.put(
  "/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  progressController.updateHabitProgress
);

module.exports = router;
