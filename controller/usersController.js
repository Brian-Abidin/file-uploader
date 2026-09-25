const { body } = require("express-validator");
const multer = require("multer");
const prisma = require("../lib/prisma");
const queries = require("../services/userService");

// finds the last occurrence of a string and replaces target with replacement
function replaceLast(str, target, replacement) {
  // Find the index of the last occurrence
  const lastIndex = str.lastIndexOf(target);

  // If the target isn't found, return the original string
  if (lastIndex === -1) return str;

  // Split and recombine the string
  return (
    str.slice(0, lastIndex) + replacement + str.slice(lastIndex + target.length)
  );
}

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
  let message = "User is already setup.";
  if (count === 0) {
    await createRootFolder(user.id);
    message = "Initial user setup complete. Welcome!";
  }
  return message;
}

// function findFullPath(startPath, root) {
//   const currPath = `${startPath}`;

//   if (startPath === root) {
//     return null;
//   }

// }

async function getCurrPath(folderId) {
  // using pathId, get current directory
  const folder = await queries.getFileById(Number(folderId));
  // console.log(folder);
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

function sortFiles(files) {
  const target = "FOLDER";
  files.sort((a, b) => {
    if (a.type === target) return -1;
    if (b.type === target) return 1;
    return a.type.localeCompare(b.type);
  });
  return files;
}

async function getRootFolder(req, res) {
  if (req.isAuthenticated()) {
    const allFiles = await queries.getAllItemsByPath("/");
    sortFiles(allFiles);
    const datesArr = formatFileDates(allFiles);
    const sizesArr = formatFileSizes(allFiles);

    // console.log("HEREE", allFiles);
    allFiles.forEach((file) => {
      console.log("HERE", file);
    });

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
    sortFiles(allFiles);
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

// returns an array of ids of all the folder ancestors of the current file
async function getAllAncestorsById(id) {
  let ancestors = [];
  const file = await queries.getFileById(Number(id));
  // 7 is the id for the root folder
  if (file.parentId === null || file.parentId === 7) {
    return ancestors;
  }
  ancestors.push(file.parentId);
  ancestors = ancestors.concat(await getAllAncestorsById(file.parentId));

  return ancestors;
}

// using id, update folder size based on the children inside
async function updateFolderSizeById(id) {
  const children = await queries.getAllItemsByParentId(id);
  let bytes = 0;
  children.forEach((child) => {
    bytes += child.size;
  });
  // while parent id !== 7 (root), then climb up and update that folder size too
  await queries.updateFileSizeById(id, bytes);
}

async function updateMultipleFolderSizes(idsArr) {
  idsArr.forEach((id) => {
    updateFolderSizeById(id);
  });
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
    // after file is created get an array of file's
    // ancestor's ids. Then updating the ancestors and the
    // file's sizes
    updateFolderSizeById(parentId);
    const ancestors = await getAllAncestorsById(parentId);
    console.log(ancestors, "ANCESTORS");
    updateMultipleFolderSizes(ancestors);
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

  // current directory is the root folder
  if (currFolderId.length === 0) {
    parentId = await queries.getItemIdByPath("/");
    const exists = await queries.getFileByNameAndParentId(folderName, parentId);
    if (exists) {
      const errors = `Folder with the name ${folderName} already exists in this directory`;
      return res.status(500).render("failure", { errors });
    }

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

    const exists = await queries.getFileByNameAndParentId(folderName, parentId);
    if (exists) {
      const errors = `Folder with the name ${folderName} already exists in this directory`;
      return res.status(500).render("failure", { errors });
    }

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

  return res.redirect(`/folders/${currFolderId}`);
}

async function deleteFile(req, res) {
  console.log("is this working? WAIT IT WAS WORKING");
  console.log(req.body, "HEREEEERESFSFESF");
  await queries.deleteFileById(Number(req.body.id));

  // after deletion query, update folder sizes
  updateFolderSizeById(Number(req.body.id));
  const ancestors = await getAllAncestorsById(Number(req.body.id));
  updateMultipleFolderSizes(ancestors);

  res.redirect("/");
}

function findNthInstance(str, char, n) {
  // uses global flag to check all instance of char
  const regex = new RegExp(char, "g");
  const matches = [...str.matchAll(regex)]; // using spread operator to convert iterator (.matchAll) to array

  console.log(matches.at(-1).index, "MATCHESSSS");
  // returns index of last instance of the char
  return matches.at(-1).index;
}

function updatePathString(oldStr, oldName, currName, index) {
  const firstHalf = oldStr.slice(0, index);
  const secondHalf = oldStr.slice(index);
  const newString = firstHalf + secondHalf.replace(oldName, currName);
  console.log(firstHalf, "first");
  console.log(secondHalf, "second");
  console.log(newString, "NEWWWW22");
  return newString;
}

async function getAllDescendants(id) {
  let descendants = [];
  const item = await queries.getFileById(id);

  if (item.children.length < 1) {
    return descendants;
  }

  for await (const child of item.children) {
    descendants.push(child.id);
    console.log(descendants, "DES");
    descendants = descendants.concat(await getAllDescendants(child.id));
  }

  return descendants;
}

// using an array of ids, update the items' path string
async function updateDescendantsPathById(idArr, oldName, newName, indexPath) {
  idArr.forEach(async (id) => {
    const item = await queries.getFileById(Number(id));
    const newPath = updatePathString(item.path, oldName, newName, indexPath);
    console.log(item.path, newPath, "COMPARISON FOR", item.id);
    await queries.editFilePathById(id, newPath);
  });
}

// using an array of ids, update the items' location string
async function updateDescendantsLocationById(
  idArr,
  oldName,
  newName,
  indexPath
) {
  idArr.forEach(async (id) => {
    const item = await queries.getFileById(Number(id));
    const newLocation = updatePathString(
      item.location,
      oldName,
      newName,
      indexPath
    );
    console.log(item.location, newLocation, "COMPARISON FOR LOCATION", item.id);
    await queries.editFileLocationById(id, newLocation);
  });
}

// updates item's own path string
async function updateSelfPathById(id, oldName, newName, indexPath) {
  const item = await queries.getFileById(Number(id));
  const newPath = updatePathString(item.path, oldName, newName, indexPath);
  console.log(newPath, "ORIGINAL");
  await queries.editFilePathById(id, newPath);
}

async function editFolder(req, res) {
  console.log(req.body);
  const file = await queries.getFileById(Number(req.body.id));
  // returns array of ids from the descendants of the item with id = req.body.id
  const descendants = await getAllDescendants(Number(req.body.id));
  // find at what index does the file exists in the path string based on num of times
  const index = findNthInstance(file.path, "/");
  // update the path string for the file
  updateSelfPathById(req.body.id, file.name, req.body.name, index);
  // updates the path string for all descendants of the file
  updateDescendantsPathById(descendants, file.name, req.body.name, index);
  // updates the location string for all descendants of the file
  updateDescendantsLocationById(descendants, file.name, req.body.name, index);
  // updates the name of the file to the new name
  await queries.editFileNameById(Number(req.body.id), req.body.name);
  updateFolderSizeById(Number(req.body.id));
  const ancestors = await getAllAncestorsById(Number(req.body.id));
  console.log(ancestors, "ANCESTORS");
  updateMultipleFolderSizes(ancestors);
  res.redirect(`${req.body["web-page-path"]}`);
}

async function downloadFile(req, res) {
  // const filePath = get physical file directory path
  // use __dirname to get the current path then find the path to uploads
  // const filePath = 'uploads/' + filename
  // for filename use query in prisma to get the filename from the id passed through the form
  // res.download(filePath, (err) => { if (err) console.error (download failed) ) )})
}

module.exports = {
  getIndex,
  getRootFolder,
  getFolders,
  passwordConfirmation,
  getFailure,
  getForm,
  postUpload,
  postFolder,
  deleteFile,
  editFolder
};
