// check if user logged in for login required actions

// check if access token is valid with JWT
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const { AppError, sendResponse } = require("../helpers/utils");

const authentication = {};

authentication.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    if (!tokenString) {
      throw new AppError(401, "Login required", "Authentication Error");
    }

    // remove "Bearer " string from the token
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          throw new AppError(401, "Token expired", "Authentication Error");
        } else {
          throw new AppError(401, "Invalid token", "Authentication Error");
        }
      }
      req.userId = payload._id;
    });

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authentication;
