const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const bcrypt = require("bcryptjs");
const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const mailController = require("./mail.controller");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

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
    throw new AppError(400, "Wrong password", "Login error");
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

authController.forgotPassword = catchAsync(async (req, res, next) => {
  // Get data
  const { email } = req.body;

  // Validation
  let user = await User.findOne({ email });
  if (!user) {
    throw new AppError(400, "User not found", "Reset Password error");
  }

  // Process
  // JWT token
  const resetToken = await user.generateToken();
  user.resetToken = resetToken;
  const resetPasswordLink = `${process.env.DEPLOY_URL}/reset-password`;

  const mailOptions = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: `Reset password`,
    html: `Click the following link to reset your password: <a href="${resetPasswordLink}">Reset password</a>`,
    text: `Click the following link to reset your password: <a href="${resetPasswordLink}">Reset password</a>`,
  };

  transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      console.log("err:", err);
      throw new AppError(400, err, "Send Reset Password Email error");
    } else {
      console.log("response:", response);
    }
  });

  // Send response
  return sendResponse(
    res,
    200,
    true,
    // mailOptions,
    { user, resetToken },
    null,
    "Send Reset Password Email success"
  );
});

module.exports = authController;
