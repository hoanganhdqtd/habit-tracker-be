const bcrypt = require("bcryptjs");
const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");

const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  // Get data from request
  let { email, password } = req.body;

  // Business logic validation
  // to find based on email along with password
  let user = await User.findOne({ email }, "+password");
  if (!user) {
    throw new AppError(400, "Invalid credentials", "Login Error");
  }

  // Process
  // user.password: encrypted password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(400, "Wrong password", "Login Error");
  }

  // JWT token
  const accessToken = await user.generateToken();

  console.log("accessToken:", accessToken);

  // Response
  // res.send("User registration");
  // sendResponse(res, statusCode, isSuccessful, data, error, message)
  sendResponse(
    res,
    200,
    true,
    // { name, email, password },
    { user, accessToken },
    null,
    "Login successfully"
  );
});

authController.register = catchAsync(async (req, res, next) => {});

module.exports = authController;
