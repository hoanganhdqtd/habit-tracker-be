const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const Habit = require("../models/Habit");
const User = require("../models/User");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDGRID_API_KEY,
    },
  })
);

const mailController = {};

// https://stackoverflow.com/questions/70117877/use-variables-instead-of-numbers-to-set-node-cron-schedule
// Send email notifications for a reminder
// POST /mail
// mailController.sendNotification = catchAsync(async (req, res, next) => {
//   let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.MAIL_USERNAME,
//       pass: process.env.MAIL_PASSWORD,
//       // type: "OAuth2",
//       // clientId: process.env.OAUTH_CLIENTID,
//       // clientSecret: process.env.OAUTH_CLIENT_SECRET,
//       // refreshToken: process.env.OAUTH_REFRESH_TOKEN,
//     },
//   });
//   let mailOptions = {
//     from: process.env.MAIL_USERNAME,
//     to: process.env.MAIL_USERNAME,
//     subject: "Notification",
//     text: "To-do jobs",
//   };
//   transporter.sendMail(mailOptions, (err, data) => {
//     if (err) {
//       console.log("Transporter err:", err.message);
//     } else {
//       console.log("Email sent successfully");
//     }
//   });
// });

mailController.sendNotification = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const { habit: habitId, content } = req.body;

  // Validation
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new AppError(400, "User not found", "Send Mail Notification error");
  }

  // Process
  const habit = await Habit.findById(habitId);

  const email = {
    to: user.email,

    // from: "habittracker@express.com",
    from: process.env.SENDER_EMAIL,
    subject: `${habit.name} notification`,
    html: "<h1>Note<h1>",
    text: content,
  };

  transporter.sendMail(email, (err, response) => {
    if (err) {
      console.log("err:", err);
      throw new AppError(400, err, "Send Notification error");
    } else {
      console.log("response:", response);
    }
  });

  // Send response
  return sendResponse(res, 200, true, email, null, "Send Notification success");
});

module.exports = mailController;
