const bcrypt = require("bcryptjs");
const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");

const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  // Get data from request
  let { email, password } = req.body;
  // console.log("password:", password);
  //  const salt = await bcrypt.genSalt(10);
  //  password = await bcrypt.hash(password, salt);

  // Business logic validation
  // to find based on email along with password
  let user = await User.findOne({ email }, "+password");
  console.log("user:", user);
  if (!user) {
    throw new AppError(400, "Invalid credentials", "Login Error");
  }

  // Process
  // user.password: encrypted password
  const isMatch = await bcrypt.compare(password, user.password);
  // const isMatch = password === user.password;
  console.log("user.password:", user.password);
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

module.exports = authController;
