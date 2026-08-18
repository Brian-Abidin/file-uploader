const { body } = require("express-validator");
const multer = require("multer");
const prisma = require("../lib/prisma");

async function getIndex(req, res) {
  console.log(res.locals);
  res.render("index", {
    greeting: "hello world",
    user: req.user
  });
}

function passwordConfirmation() {
  body("confirm-password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  });
}

async function getForm(req, res) {
  res.render("sign-up-form");
}

async function getFailure(req, res) {
  const errors = req.session.messages || [];
  req.session.messages = [];
  res.render("failure", { errors });
}

module.exports = {
  getIndex,
  passwordConfirmation,
  getFailure,
  getForm
};
