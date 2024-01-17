require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var mongoose = require("mongoose");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("./models/User");

const { sendResponse } = require("./helpers/utils");

// const cron = require("node-cron");

// const nodemailer = require("nodemailer");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log(err));

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/habit-tracker",
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    { successRedirect: "/" }
    // function (req, res) {
    //   // Successful authentication, redirect home.
    //   res.redirect("/");
    // }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // Authorized redirect URIs from Google OAuth2 setting
      // callbackURL: "/auth/google/habit-tracker",
      callbackURL: process.env.GOOGLE_CALLBACK_URL,

      // userInfo fields: name (full name), email, picture (AvatarUrl)
      userProfile: "https://www.googleapis.com/oauth2/v2/userinfo",
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log("Google accessToken:", accessToken);
      console.log("Google profile:", profile);
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  )
);

var indexRouter = require("./routes/index");
app.use("/api", indexRouter);

// Error handlers
// catch error 404
app.use((req, res, next) => {
  const err = new Error("Not found");
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err);

  if (err.isOperational) {
    // AppError
    // sendResponse(res, statusCode, isSuccessful, data, message, errorType)
    // sendResponse(res, statusCode, isSuccessful, data, errorType, message)
    return sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      { message: err.message },
      err.errorType
    );
  }

  return sendResponse(
    res,
    err.statusCode ? err.statusCode : 500,
    false,
    null,
    { message: err.message },
    "Internal Server Error"
  );
});

module.exports = app;
