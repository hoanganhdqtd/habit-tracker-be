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
  const token = await jwt.sign({ _id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  const checksum = crypto.createHash("sha256").update(token).digest("hex");

  const expiredChecksums = [];

  for (const existingChecksum in passwordResetCheckSums) {
    const { userId: checksumUserId } = passwordResetCheckSums[existingChecksum];

    // Check if any existing checksums expire or correspond to the same userId
    const isChecksumValid = await verifyChecksum(existingChecksum);

    if (!isChecksumValid || checksumUserId === userId) {
      // Add expired checksums to remove later
      expiredChecksums.push(existingChecksum);
    }
  }

  // Remove expired checksums
  expiredChecksums.forEach((checksum) => {
    delete passwordResetCheckSums[checksum];
  });

  passwordResetCheckSums[checksum] = { userId, token };

  return checksum;
}

// Verify token
async function verifyChecksum(checksum) {
  // console.log("checksum to verify:", checksum);
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
  const checksum = await createChecksum(user._id.toString());
  const resetPasswordLink = `${process.env.DEPLOY_URL}/reset-password?checksum=${checksum}`;

  // Send email
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Password Reset",
    html: `Click the following link to reset your password: ${resetPasswordLink}.\nThis link only works in <b>1h</b>.`,
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

  // Validation

  // Verify checksum
  const isChecksumValid = await verifyChecksum(checksum);
  if (!isChecksumValid) {
    delete passwordResetCheckSums[checksum];
    throw new AppError(400, "Checksum invalid", "Reset Password error");
  }

  const { userId } = passwordResetCheckSums[checksum];
  let user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(
      400,
      "User not found or Checksum invalid",
      "Reset Password error"
    );
  }

  // Remove the used reset checksum
  delete passwordResetCheckSums[checksum];

  // Process
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

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
