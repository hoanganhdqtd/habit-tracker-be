const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const validators = require("../middlewares/validators");

const authController = require("../controllers/auth.controller");

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

/**
 * @route POST /auth/forgot-password
 * @description send email with link to reset password
 * @body { email }
 */
router.post(
  "/forgot-password",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .bail()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
  ]),
  authController.forgotPassword
);

/**
 * @route POST /auth/reset-password
 * @description reset password
 * @body { checksum, newPassword }
 */
router.post("/reset-password", authController.resetPassword);

module.exports = router;
