const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
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

const passwordResetCheckSums = {};

// Generate reset token
const createResetToken = async (userId, expireTime) => {
  const resetToken = await jwt.sign(
    { _id: userId },
    process.env.JWT_SECRET_KEY,
    {
      // expiresIn: "1h",
      expiresIn: expireTime,
    }
  );
  return resetToken;
};

// Create checksum
function createChecksum(userId, expireTime, secret) {
  const checksumString = `${userId}-${expireTime}-${secret}`;
  const checksum = crypto
    .createHmac("sha256", process.env.CHECKSUM_SECRET_KEY)
    .update(checksumString)
    .digest("hex");
  passwordResetCheckSums[checksum] = userId;
  return checksum;
}

// Verify checksum
async function verifyChecksum(userId, expireTime, resetToken, checksum) {
  console.log("passwordResetCheckSums:", passwordResetCheckSums);
  console.log("resetToken:", resetToken);
  console.log("checksum:", checksum);
  try {
    const decoded = await jwt.verify(resetToken, process.env.JWT_SECRET_KEY);
    // The token is valid
    const newChecksum = createChecksum(userId, expireTime, resetToken);
    console.log("newChecksum:", newChecksum);
    return decoded && newChecksum === checksum;
  } catch (err) {
    console.log("error:", err);
  }
}

const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  // Get data from request
  let { email, password } = req.body;

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

  if (!isMatch) {
    throw new AppError(400, "Wrong password", "Login error");
  }

  // JWT token
  const accessToken = await user.generateToken();

  // console.log("accessToken:", accessToken);

  // Response
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
  // const expireTime = Date.now() + 3600000; // 1h
  const expireTime = "1h";
  const resetToken = await createResetToken(user._id, 60);
  // console.log("forgotPassword resetToken:", resetToken);
  const checksum = createChecksum(user._id, expireTime, resetToken);
  const resetPasswordLink = `${process.env.DEPLOY_URL}/reset-password?checksum=${checksum}`;

  // Send email
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Password Reset",
    html: `Click the following link to reset your password: ${resetPasswordLink}`,
  };

  transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      console.log("err:", err);
      throw new AppError(400, err, "Send Password Reset Email error");
    } else {
      console.log("response:", response);
      // res.send("Password reset email sent. Please check your email.");
    }
  });

  // Send response
  return sendResponse(
    res,
    200,
    true,
    // mailOptions,
    null,
    null,
    "Send Password Reset Email success"
  );
});

authController.resetPassword = catchAsync(async (req, res, next) => {
  // Get data
  const { checksum, newPassword } = req.body;
  // console.log("checksum:", checksum);
  // console.log("newPassword:", newPassword);

  // Validation
  const userId = passwordResetCheckSums[checksum];
  const expireTime = "1h";
  const resetToken = await createResetToken(userId, 60);
  // console.log("resetPassword resetToken:", resetToken);

  // console.log("resetPassword userId:", userId);

  let user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(
      400,
      "User not found or Checksum invalid",
      "Reset Password error"
    );
  }

  // Verify checksum
  const isChecksumValid = verifyChecksum(
    userId,
    expireTime,
    // process.env.CHECKSUM_SECRET_KEY,
    resetToken,
    checksum
  );

  if (!isChecksumValid) {
    throw new AppError(400, "Checksum invalid", "Reset Password error");
  }

  // Process
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Remove the used reset checksum
  delete passwordResetCheckSums[checksum];

  const accessToken = await user.generateToken();

  // Send response
  return sendResponse(
    res,
    200,
    true,
    // mailOptions,
    // { user, resetToken },
    { user, accessToken },
    null,
    "Password Reset success"
  );
});

module.exports = authController;
