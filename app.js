require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const cors = require("cors");
app.use(cors());

// const cron = require("node-cron");

// const nodemailer = require("nodemailer");

const { sendResponse } = require("./helpers/utils");

const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log(err));

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
