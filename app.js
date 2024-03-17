require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var session = require("express-session");

var mongoose = require("mongoose");

const mailController = require("./controllers/mail.controller");
const User = require("./models/User");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { sendResponse, AppError } = require("./helpers/utils");

const cron = require("node-cron");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use(cors());
// app.use(
//   cors({
//     origin: process.env.DEPLOY_URL,
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   })
// );

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.DEPLOY_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});

const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("DB connected successfully");
    // Set email tasks schedule
    cron.schedule("* * * * *", mailController.scheduleTasks);
  })
  .catch((err) => console.log(err));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // Authorized redirect URIs from Google OAuth2 setting
      callbackURL: process.env.GOOGLE_CALLBACK_URL,

      userProfile: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatarUrl = profile.picture;
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            name,
            avatarUrl,
            // googleId: profile.id,
          });
        }
        const JWT_accessToken = await user.generateToken();
        user.googleId = profile.id;
        await user.save();

        return cb(null, { user, accessToken: JWT_accessToken }); // null: no err
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    cookie: {
      maxAge: 86400000, // 1d
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/habit-tracker",
  passport.authenticate("google", {
    failureRedirect: `${process.env.DEPLOY_URL}/login`,
  }),
  function (req, res) {
    // Successful authentication, redirect
    res.redirect(`${process.env.DEPLOY_URL}/google-login`);
  }
);

// To get data from Google account
app.get("/google-login/success", async (req, res) => {
  if (!req.user) {
    throw new AppError(400, "Not authorized", "Google Login error");
  }

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", process.env.DEPLOY_URL);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);

  // return data from req.user
  return sendResponse(
    res,
    200,
    true,
    {
      user: req.user.user,
      accessToken: req.user.accessToken,
    },
    null,
    "Google Login success"
  );
});

app.get("/logout", (req, res, next) => {
  // call Passport logout
  if (req.user) {
    req.session.destroy();
    req.logout((err) => {
      if (err) {
        console.log("err");
        return next(err);
      }
      res.redirect("/");
    });
  }
});

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
