const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const cron = require("node-cron");

const Habit = require("../models/Habit");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const dayjs = require("dayjs");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDGRID_API_KEY,
    },
  })
);

const mailController = {};

const sendNotification = async (habit) => {
  const email = {
    to: habit.user.email,
    from: process.env.SENDER_EMAIL,
    subject: `${habit.name} notification`,
    html: `Note! You have <b>${habit.name}</b> to complete`,
  };

  transporter.sendMail(email, (err, response) => {
    if (err) {
      console.log("err:", err);
      throw new AppError(400, err, "Send Notification error");
    } else {
      console.log("response:", response);
    }
  });
};

mailController.scheduleTasks = catchAsync(async (req, res, next) => {
  const habits = await Habit.find().populate("user").populate("reminders");

  habits.forEach((habit) => {
    habit.reminders.forEach(async (reminder) => {
      const cronExpression = `${dayjs(reminder.time).minute()} ${dayjs(
        reminder.time
      ).hour()} * * *`;
      // console.log("cronExpression:", cronExpression);

      // cron.schedule(cronExpression, async () => {
      //   // Check if the reminder is ongoing
      //   if (reminder.status === "ongoing") {
      //     // Send notification
      //     await sendNotification(habit);
      //   }
      // });
      if (
        dayjs(reminder.time).isSame(dayjs(Date.now()), "minute") &&
        reminder.status === "ongoing"
      ) {
        await sendNotification(habit);
      }
    });
  });
});

mailController.sendResetPasswordEmail = catchAsync(async (req, res, next) => {
  // Get data
  const { email } = req.body;
  // Validation
  // Process
  const mailOptions = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: `Reset password`,
    html: "<h1>Reset password<h1>",
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
    null,
    null,
    "Send Reset Password Email success"
  );
});

module.exports = mailController;
