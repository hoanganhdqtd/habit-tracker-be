const bcrypt = require("bcryptjs");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const userController = {};

const User = require("../models/User");

// Register
userController.register = catchAsync(async (req, res, next) => {
  // Get data
  let { name, email, password } = req.body;

  // Validation
  let user = await User.findOne({ email });
  if (user) {
    throw new AppError(404, "User already exists", "Registration error");
  }

  // Process

  // user = await User.create({ name, email, password });

  // encrypt password before saving to database
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password });

  // Create JWT access token
  const accessToken = await user.generateToken();

  // Send response
  sendResponse(
    res,
    200,
    true,
    // { name, email, password },
    { user, accessToken },
    null,
    "Create User success"
  );
});

// Get the current user's info
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;

  // Validation

  // Process
  // Find user
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new AppError(400, "User not found", "Get Current User error");
  }

  // Send response
  return sendResponse(res, 200, true, user, null, "Get Current User success");
});

// Update the current user's profile
userController.updateProfile = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;

  // Validation
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new AppError(400, "User not found", "Update Profile error");
  }

  // Process
  // fields allowed to update
  const allowedFields = ["name", "password", "avatarUrl"];
  allowedFields.forEach(async (field) => {
    if (req.body[field] !== undefined) {
      if (field === "password") {
        const salt = await bcrypt.genSalt(10);
        user[field] = await bcrypt.hash(req.body[field], salt);
      } else {
        user[field] = req.body[field];
      }
    }
  });
  // save updated user
  await user.save();

  // Response
  return sendResponse(res, 200, true, user, null, "Update Profile success");
});

module.exports = userController;
