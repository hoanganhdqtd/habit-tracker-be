const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route POST /mail
 * @description send email notifications
 * @body { }
 * @access Public
 */
const mailController = require("../controllers/mail.controller");

router.post("/", mailController.notificationMailer);

module.exports = router;
