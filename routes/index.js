var express = require("express");
var router = express.Router();

// auth API
const authApi = require("./auth.api");
router.use("/auth", authApi);

// user API
const userApi = require("./user.api");
router.use("/users", userApi);

// habit API
const habitApi = require("./habit.api");
router.use("/habits", habitApi);

// progress API
const progressApi = require("./progress.api");
router.use("/progress", progressApi);

// reminder API
const reminderApi = require("./reminder.api");
router.use("/reminders", reminderApi);

// tag API
const tagApi = require("./tag.api");
router.use("/tags", tagApi);

module.exports = router;
