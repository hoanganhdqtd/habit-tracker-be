const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");

const validators = require("../middlewares/validators");

/**
 * @route POST /auth/login
 * @description Login with email and password
 * @body { email, password }
 * @access Public
 */

// the controllers still run if validators.validate() is not executed
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .bail()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().bail().notEmpty(),
  ]),
  authController.loginWithEmail
);

module.exports = router;
