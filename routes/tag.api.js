var express = require("express");
const router = express.Router();

const { body, param } = require("express-validator");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

const tagController = require("../controllers/tag.controller");

/**
 * @route POST /tags
 * @description Create a new tag
 * @body { title }
 * @access Login required
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([body("title", "Missing title").exists().notEmpty()]),
  tagController.createTag
);

/**
 * @route GET /tags
 * @description Get all tags created by the current user
 * @access Login required
 */
router.get("/", authentication.loginRequired, tagController.getTags);

/**
 * @route PUT /tags/:id
 * @description Update a tag with a specific id
 * @access Login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  tagController.updateSingleTag
);

/**
 * @route DELETE /tags/:id
 * @description Delete a tag with a specific id
 * @access Login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  tagController.deleteSingleTag
);

/**
 * @route PUT /tags/:tagId/habit/:habitId
 * @description Remove a tag from a habit's tags
 * @access Login required
 */
router.put(
  "/:tagId/habit/:habitId",
  authentication.loginRequired,
  validators.validate([
    param("tagId").exists().isString().custom(validators.checkObjectId),
    param("habitId").exists().isString().custom(validators.checkObjectId),
  ]),
  tagController.removeSingleHabitTag
);

module.exports = router;
