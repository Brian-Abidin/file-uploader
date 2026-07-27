const session = require("express-session");
const express = require("express");
const path = require("node:path");
const passport = require("passport");
const usersRouter = require("./routes/usersRouter");
const passportController = require("./config/passport");
require("dotenv").config();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// used to use static files in the public folder
app.use(express.static("public"));

// creating the express session and executing passport.session
// THIS IS FROM THE EXAMPLE IN ODIN PROJECT; UPDATE FOR INDIVIDUAL PROJECT
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());

// used to parse form data into req.body
app.use(express.urlencoded({ extended: true }));
passport.use(passportController.localStratregy);

passport.serializeUser(passportController.serializeUser);
passport.deserializeUser(passportController.deserializeUser);

app.use(passportController.currentUser);

// uses usersRouter to route all views and display them in app
app.use("/", usersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening to port ${PORT}`));
