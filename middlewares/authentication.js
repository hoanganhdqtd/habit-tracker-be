// check if user logged in for login required actions

// check if access token is valid with jwt
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const { AppError, sendResponse } = require("../helpers/utils");

const authentication = {};

authentication.loginRequired = (req, res, next) => {
  try {
    // get accessToken

    // authentication does not work
    // const tokenString = req.headers.authentication;

    // accessToken created after successful login is
    // saved to accessToken variable (Variable tab)
    // (thanks to Tests code) and accessToken token
    // (Authorization tab => req.headers.authorization)
    const tokenString = req.headers.authorization;
    // console.log("tokenString:", tokenString);

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

      // payload got from the token to verify
      // payload._id added in userSchema.methods.generateToken

      // if no error => controllers following authentication.loginRequired
      // in routes/*.api.js can access userId (currentUserId)
      // by req.userId
      req.userId = payload._id;
    });

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authentication;
