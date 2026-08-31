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

async function getCurrPath(folderId, root) {
  const formattedFolderId = folderId.replaceAll("/", "");
  console.log(formattedFolderId, "IDDDD");
  if (formattedFolderId) {
    // using pathId, get current directory
    const folder = await queries.getFolderById(Number(formattedFolderId));
    const currPath = folder.path;
    return currPath;
  }
  // get root directory
  return root;
}

async function getIndex(req, res) {
  if (req.isAuthenticated()) {
    const currFolderId = Number(req.path.replaceAll("/", ""));
    let allFiles = "";
    if (currFolderId === 0) {
      allFiles = await queries.getAllItemsByPath(req.path);
    } else {
      allFiles = await queries.getFilesByFileId(currFolderId);
    }
    const datesArr = formatFileDates(allFiles);
    const sizesArr = formatFileSizes(allFiles);

    console.log("GREETING", await setupInitialLogin(req.user));

    console.log(allFiles);
    console.log(res.locals);
    console.log(req.path, "NEW@@@@@");

    const currPath = await getCurrPath(req.path, "/");
    console.log(currPath);
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
  const path = req.body["page-path"];
  const currPath = await getCurrPath(path, "/");
  const formattedPath = currPath.replace("/", "");
  let parentId = Number(path.replaceAll("/", ""));
  if (parentId === 0) {
    parentId = await queries.getItemIdByPath(path);
  }

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
    `${path}/${req.file.filename}`,
    req.file.size,
    formattedPath,
    req.user.id,
    parentId
  );
  res.redirect("/");
}

async function postFolder(req, res) {
  const folderName = req.body.folder;
  const path = req.body["page-path"];
  const currPath = await getCurrPath(path, "/");
  const formattedPath = currPath.replace("/", "");
  let parentId = Number(path.replaceAll("/", ""));
  if (parentId === 0) {
    parentId = await queries.getItemIdByPath(path);
  }

  console.log("HRESRESRHEH", folderName, await getCurrPath(path, "/"));

  // console.log("HEREeEEE", newPath);

  await queries.createNewFolder(
    folderName,
    "FOLDER",
    `${formattedPath}/${folderName}`, // need to get current directory ex. test/
    0,
    currPath,
    parentId,
    req.user.id
  );

  // await queries.createNewFolder(folderName, "FOLDER");
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
