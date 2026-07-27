const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { hash } = require("node:crypto");
const pool = require("../db/pool");

// example used in odin project -- update for project

// this is the function that is called when using passport.authenticate
// acts like a middleware and is called when asking passport for authentication
const localStratregy = new LocalStrategy(async (username, password, done) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    const user = rows[0];
    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }
    console.log(password, user.password);
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

// Functions 2 and 3: sessiosn and serialization
// not calling these functions on our own just defining them,
// so they're used in the background for passport
const serializeUser = (user, done) => {
  done(null, user.id);
};

const deserializeUser = async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id
    ]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
};

const currentUser = (req, res, next) => {
  res.locals.currentUser = req.user;
  next();
};

const passportAuth = () => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/failure"
  });
};

const logoutRequest = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

const encryptPassword = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      req.body.username,
      hashedPassword
    ]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  localStratregy,
  serializeUser,
  deserializeUser,
  currentUser,
  passportAuth,
  logoutRequest,
  encryptPassword
};
