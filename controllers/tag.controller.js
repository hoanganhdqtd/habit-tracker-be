const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const Tag = require("../models/Tag");

const tagController = {};

// Create a new tag
// POST /tags
tagController.createTag = catchAsync(async (req, res, next) => {
  // Get data
  const { title, habitId } = req.body;
  const currentUserId = req.userId;

  // Validation
  // Process
  const newTag = await Tag.create({ title, user: currentUserId, habits: [] });
  if (habitId) {
    newTag.habits.push(habitId);
  }

  await newTag.save();

  // Send response
  return sendResponse(res, 200, true, newTag, null, "Create Tag success");
});

// Get tags created by the current user
// GET /tags
tagController.getTags = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;

  // Validation

  // Process
  const tags = await Tag.find({ user: currentUserId });

  // Send response
  return sendResponse(res, 200, true, tags, null, "Get Tags success");
});

// Update a tag with a specific id
// PUT /tags/:id
tagController.updateSingleTag = catchAsync(async (req, res, next) => {
  // Get data
  const tagId = req.params.id;
  const currentUserId = req.userId;
  const { title, habitId } = req.body;

  // Validation

  // Process
  const tag = tag.findById(tagId);
  if (!tag) {
    throw new AppError(400, "Tag not found", "Update Single Tag error");
  }

  if (title) {
    tag.title = title;
  }

  if (habitId) {
    tag.habits.push(habitId);
  }

  await tag.save();

  // Send response
  return sendResponse(res, 200, true, tag, null, "Update Single Tag success");
});

// Remove a tag from a habit's tags
// PUT /tags/:tagId/:habitId
tagController.removeSingleHabitTag = catchAsync(async (req, res, next) => {
  // Get data
  const { tagId, habitId } = req.params;

  // Validation
  // Process
  // Send response
});

// Delete a tag with a specific id
// DELETE /tags/:id
tagController.deleteSingleTag = catchAsync(async (req, res, next) => {
  // Get data
  const tagId = req.params.id;

  // Validation
  // Process
  const tag = await Tag.findByIdAndDelete(tagId);
  if (!tag) {
    throw new AppError(400, "Tag not found", "Delete Single Tag error");
  }

  // Send response
  return sendResponse(res, 200, true, tag, null, "Delete Single Tag success");
});

module.exports = tagController;
