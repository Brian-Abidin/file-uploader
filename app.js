const session = require("express-session");
const express = require("express");
const path = require("node:path");
const passport = require("passport");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma/client.js");
const usersRouter = require("./routes/usersRouter");
const passportController = require("./config/passport");

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

require("dotenv").config();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// used to use static files in the public folder
app.use(express.static("public"));
// used to used static files in the dist folder
app.use(express.static(path.join(__dirname, "dist")));

// creating the express session with Prisma Session store layer and executing passport.session
app.use(
  session({
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }, // 30 days
    secret: "cats",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 1000 * 60 * 2, // check every 2 minutes
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined
    })
  })
);
app.use(passport.session());

// used to parse form data into req.body
app.use(express.urlencoded({ extended: true }));
passport.use(passportController.localStratregy);

passport.serializeUser(passportController.serializeUser);
passport.deserializeUser(passportController.deserializeUser);

app.use(passportController.currentUser);

// uses usersRouter to route all views and display them in app
app.use("/", usersRouter);

module.exports = app;
