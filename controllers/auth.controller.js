const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

const passwordResetCheckSums = {};

// Create checksum
async function createChecksum(userId) {
  console.log("userId:", userId);
  const expiresIn = 3600; // 3600s
  const payload = {
    userId,
    expires: Date.now() + expiresIn * 1000,
  };
  console.log("payload:", payload);
  // passwordResetCheckSums[checksum] = {
  //   userId,
  //   expireTime: Date.now() + 3600000,
  // };
  const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY);
  const checksum = crypto.createHash("sha256").update(token).digest("hex");

  passwordResetCheckSums[checksum] = { userId, token };
  console.log("passwordResetCheckSums:", passwordResetCheckSums);
  return checksum;
}

// Verify token
async function verifyChecksum(checksum) {
  console.log("checksum to verify:", checksum);
  try {
    // Retrieve the stored userId and token from the passwordResetCheckSums
    const { userId, token } = passwordResetCheckSums[checksum];

    await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log("decoded:", decoded);
    return true;
  } catch (error) {
    return false;
  }
}

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
  // check if encrypted passwords match
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(400, "Wrong password", "Login error");
  }

  // Create JWT token
  const accessToken = await user.generateToken();

  // console.log("accessToken:", accessToken);

  // Response
  sendResponse(
    res,
    200,
    true,
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
  // const expireTime = "1h";
  // const resetToken = await createResetToken(user._id, 60);
  // // console.log("forgotPassword resetToken:", resetToken);
  // const checksum = createChecksum(user._id, expireTime, resetToken);

  const checksum = await createChecksum(user._id.toString());
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
    null,
    null,
    "Send Password Reset Email success"
  );
});

authController.resetPassword = catchAsync(async (req, res, next) => {
  // Get data
  const { checksum, newPassword } = req.body;
  console.log("checksum:", checksum);
  console.log("newPassword:", newPassword);

  // Validation
  console.log("passwordResetCheckSums:", passwordResetCheckSums);
  const { userId } = passwordResetCheckSums[checksum];
  console.log("userId:", userId);
  let user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(
      400,
      "User not found or Checksum invalid",
      "Reset Password error"
    );
  }

  // Verify checksum
  const isChecksumValid = await verifyChecksum(checksum);
  console.log("isChecksumValid:", isChecksumValid);

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
    { user, accessToken },
    null,
    "Password Reset success"
  );
});

module.exports = authController;
