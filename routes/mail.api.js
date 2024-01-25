const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route POST /mail
 * @description create an email notification
 * @body { }
 * @access Public
 */
const mailController = require("../controllers/mail.controller");

router.post("/", mailController.scheduleTasks);

module.exports = router;
