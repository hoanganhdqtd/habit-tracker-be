const nodemailer = require("nodemailer");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const mailController = {};

// https://stackoverflow.com/questions/70117877/use-variables-instead-of-numbers-to-set-node-cron-schedule
// Send email notifications for a reminder
// POST /mail
mailController.sendNotification = catchAsync(async (req, res, next) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      // type: "OAuth2",
      // clientId: process.env.OAUTH_CLIENTID,
      // clientSecret: process.env.OAUTH_CLIENT_SECRET,
      // refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });
  let mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: process.env.MAIL_USERNAME,
    subject: "Notification",
    text: "To-do jobs",
  };
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Transporter err:", err.message);
    } else {
      console.log("Email sent successfully");
    }
  });
});

module.exports = mailController;
