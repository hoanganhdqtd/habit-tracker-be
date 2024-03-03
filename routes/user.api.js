var express = require("express");
var router = express.Router();

const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

const userController = require("../controllers/user.controller");

/**
 * @route POST /users
 * @description Register
 * @body { name, email, password }
 * @access Public
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().bail().trim().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .bail()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().bail().notEmpty(),
  ]),
  userController.register
);

/**
 * @route GET /users/me
 * @description Get current user's info
 * @access Login required
 */
router.get("/me", authentication.loginRequired, userController.getCurrentUser);

/**
 * @route PUT /users/me
 * @description update the current user's profile
 * @body { name, password, avatarUrl }
 * @access Login required
 */
router.put("/me", authentication.loginRequired, userController.updateProfile);

module.exports = router;
