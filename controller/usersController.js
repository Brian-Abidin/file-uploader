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

// function findFullPath(startPath, root) {
//   const currPath = `${startPath}`;

//   if (startPath === root) {
//     return null;
//   }

// }

async function getCurrPath(folderId) {
  // using pathId, get current directory
  const folder = await queries.getFolderById(Number(folderId));
  console.log(folder);
  const currPath = folder.path;
  return currPath;
}

async function getIndex(req, res) {
  if (req.isAuthenticated()) {
    // check if root folder is established
    console.log("GREETING", await setupInitialLogin(req.user));
    res.redirect("/folders");
  } else {
    res.render("index");
  }
}

async function getRootFolder(req, res) {
  if (req.isAuthenticated()) {
    const allFiles = await queries.getAllItemsByPath("/");
    const datesArr = formatFileDates(allFiles);
    const sizesArr = formatFileSizes(allFiles);

    res.render("index", {
      greeting: "hello world",
      user: req.user,
      currPath: "/",
      files: allFiles,
      dates: datesArr,
      sizes: sizesArr
    });
  } else {
    res.render("index");
  }
}

async function getFolders(req, res) {
  if (req.isAuthenticated()) {
    const id = Number(req.params.id);
    const allFiles = await queries.getAllItemsByParentId(id);
    const datesArr = formatFileDates(allFiles);
    const sizesArr = formatFileSizes(allFiles);

    // console.log(allFiles);
    // console.log(res.locals, "WHAT IS THIS");

    const currPath = await getCurrPath(id);
    // console.log(currPath);
    // console.log("PAHHTHTH");

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
  const path = req.body["page-path"];
  const currFolderId = path.replace(/\D/g, "");
  let parentId = "";
  let currPath = "";

  if (!req.file) {
    res.status(404).send("No file uploaded");
  }

  // means root directory
  if (currFolderId.length === 0) {
    parentId = await queries.getItemIdByPath("/");

    await queries.createNewFile(
      req.file.filename,
      "FILE",
      req.file.mimetype,
      `/${req.file.filename}`,
      req.file.size,
      "/",
      req.user.id,
      parentId
    );
  } else {
    // file not root directory
    parentId = Number(currFolderId);
    currPath = await getCurrPath(currFolderId);

    await queries.createNewFile(
      req.file.filename,
      "FILE",
      req.file.mimetype,
      `${currPath}/${req.file.filename}`,
      req.file.size,
      currPath,
      req.user.id,
      parentId
    );
  }
  res.redirect(`/folders/${currFolderId}`);
}

async function postFolder(req, res) {
  const folderName = req.body.folder;
  const path = req.body["page-path-folder"];
  const currFolderId = path.replace(/\D/g, "");
  let parentId = "";
  let currPath = "";
  console.log(path, currFolderId, "THISSSSSS");
  if (currFolderId.length === 0) {
    parentId = await queries.getItemIdByPath("/");

    await queries.createNewFolder(
      folderName,
      "FOLDER",
      `/${folderName}`,
      0,
      "/",
      parentId,
      req.user.id
    );
  } else {
    parentId = Number(currFolderId);
    currPath = await getCurrPath(currFolderId);
    console.log(currPath, "UMMMMMMMMMMMM");

    await queries.createNewFolder(
      folderName,
      "FOLDER",
      `${currPath}/${folderName}`, // need to get current directory ex. test/
      0,
      currPath,
      parentId,
      req.user.id
    );
  }

  res.redirect(`/folders/${currFolderId}`);
}

module.exports = {
  getIndex,
  getRootFolder,
  getFolders,
  passwordConfirmation,
  getFailure,
  getForm,
  postUpload,
  postFolder
};
