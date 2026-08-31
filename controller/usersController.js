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

async function createRootFolder(userId) {
  await queries.createNewFolder("/", "FOLDER", "/", 0, "/", null, userId);
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

async function checkUserItems(username) {
  const user = await queries.getUserByUsername(username);
  const itemCount = await queries.countUserItemsByUserId(user.id);
  return itemCount;
}

async function setupInitialLogin(user) {
  const count = await checkUserItems(user.username);
  if (count === 0) {
    await createRootFolder(user.id);
    return "Initial user setup complete. Welcome!";
  }
  return "User is already setup.";
}

async function getCurrentPath(path) {
  const onlyPath = path.replaceAll("/", "");
  const pathId = Number(onlyPath);
  let currentPath = "";
  if (pathId === 0) {
    currentPath = "/";
  } else {
    const folder = await queries.getFolderById(pathId);
    currentPath = folder.id;
  }
  return currentPath;
}

async function getIndex(req, res) {
  if (req.isAuthenticated()) {
    const allFiles = await queries.getFilesByUserId(1);
    const datesArr = formatFileDates(allFiles);
    const sizesArr = formatFileSizes(allFiles);

    console.log("GREETING", await setupInitialLogin(req.user));

    console.log(allFiles);
    console.log(res.locals);
    console.log(req.path, "NEW@@@@@");

    const currPath = await getCurrentPath(req.path);
    console.log("PAHHTHTH");

    res.render("index", {
      greeting: "hello world",
      user: req.user,
      currPath,
      files: allFiles,
      dates: datesArr,
      sizes: sizesArr
    });
  } else {
    res.render("index");
  }
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

async function getCurrPath(path, root) {
  const pathId = path.replaceAll("/", "");
  if (pathId) {
    // using pathId, get current directory
    const folder = await queries.getFolderById(Number(pathId));
    const currPath = await queries.getParentPathByParentId(folder.parentId);
    return currPath;
  }
  // get root directory
  return root;
}

async function postFolder(req, res) {
  const folderName = req.body.folder;
  const path = req.body["page-path"];
  console.log("HRESRESRHEH", folderName, getCurrPath(path, req.user.username));

  // console.log("HEREeEEE", newPath);

  // await queries.createNewFolder(
  //   folderName,
  //   "FOLDER",
  //   req.file.path, // need to get current directory ex. test/
  //   0
  // );
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
