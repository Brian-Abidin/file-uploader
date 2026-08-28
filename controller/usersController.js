const { body } = require("express-validator");
const multer = require("multer");
const prisma = require("../lib/prisma");
const queries = require("../services/userService");

function formatFileSizes(files) {
  const sizesArr = [];
  for (let i = 0; i < files.length; i += 1) {
    const { size } = files[i];
    const formattedSize = Number((size / (1024 * 1024)).toFixed(2));
    sizesArr.push(formattedSize);
  }
  return sizesArr;
}

function formatFileDates(files) {
  const datesArr = [];
  for (let i = 0; i < files.length; i += 1) {
    const date = files[i].createdAt;
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    datesArr.push(formattedDate);
  }
  return datesArr;
}

async function getIndex(req, res) {
  const allFiles = await queries.getFiles(1);
  const datesArr = formatFileDates(allFiles);
  const sizesArr = formatFileSizes(allFiles);

  console.log(allFiles);
  console.log(res.locals);
  res.render("index", {
    greeting: "hello world",
    user: req.user,
    files: allFiles,
    dates: datesArr,
    sizes: sizesArr
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

async function postUpload(req, res) {
  if (!req.file) {
    res.status(404).send("No file uploaded");
  }
  const now = new Date();
  const formatted = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  console.log("File received:", req.file);
  console.log(
    "CHECK",
    "name:",
    req.file.filename,
    "type:",
    req.file.mimetype,
    "path:",
    req.file.path,
    "size:",
    (req.file.size / (1024 * 1024)).toFixed(2),
    "MB",
    "date:",
    formatted
  );
  console.log("USERRRR", req.user.id);
  await queries.createNewFile(
    req.file.filename,
    "FILE",
    req.file.mimetype,
    req.file.path,
    req.file.size,
    req.user.id
  );
  res.redirect("/");
}

async function postFolder(req, res) {
  const folderName = req.body.folder;
  //  create await to make new folder and add properties
  res.redirect("/");
}

module.exports = {
  getIndex,
  passwordConfirmation,
  getFailure,
  getForm,
  postUpload,
  postFolder
};
