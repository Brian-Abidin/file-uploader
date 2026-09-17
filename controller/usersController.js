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

async function deleteFile(req, res) {
  console.log("is this working? WAIT IT WAS WORKING");
  console.log(req.body, "HEREEEERESFSFESF");
  await queries.deleteFileById(Number(req.body.id));

  res.redirect("/");
}

async function findFileDepthById(id) {
  let fileDepth = -1;
  const file = await queries.getFolderById(id);
  let parentId = file.parentId;
  while (parentId !== null) {
    let parent = await queries.getFolderById(parentId);
    parentId = parent.parentId;
    fileDepth += 1;
  }
  console.log(fileDepth, parentId, "DEPTH HEREE");
  return fileDepth;
}

function findNthInstance(str, char, n) {
  //uses global flag to check all instance of char
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
}

function updateLocationString(oldStr, oldName, currName, index) {
  const firstHalf = oldStr.slice(0, index);
  const secondHalf = oldStr.slice(index);
  const newString = firstHalf.replace(oldName, currName) + secondHalf;
  console.log(firstHalf, "first");
  console.log(secondHalf, "second");
  console.log(newString, "NEWWWW22");
}

async function getAllDescendants(id) {
  let descendants = [];
  const item = await queries.getFolderById(id);

  if (item.children.length < 1) {
    return descendants;
  }

  for await (const child of item.children) {
    descendants.push(child.id);
    console.log(descendants, "DES");
    descendants = descendants.concat(await getAllDescendants(child.id));
  }

  return descendants;

  // console.log(item.children.length, item.id);
  // if (item.children.length > 0) {
  //   item.children.forEach(async (child) => {
  //     descendants.push(child.id);
  //     console.log(descendants, "DES");
  //     descendants = descendants.concat(
  //       await getAllDescendants(child.id),
  //       descendants
  //     );
  //   });
  // }
  // descendants.push(item.id);
  // console.log(descendants, "IMMM");
  // return descendants;
}

async function editFolder(req, res) {
  console.log(req.body);
  const file = await queries.getFolderById(Number(req.body.id));
  const fileName = file.name;
  const filePath = file.path;
  const depth = findFileDepthById(Number(req.body.id));
  const indexPath = findNthInstance(file.path, "/", depth);
  const indexLocation = findNthInstance(file.location, "/", depth);
  console.log(file.name.length, "HELLOO");
  // updatePathString(file.path, file.name, req.body.name, indexPath);
  updateLocationString(
    "/test781/test22/test788",
    file.name,
    req.body.name,
    file.name.length + 1
  );
  console.log(await getAllDescendants(Number(req.body.id)), "DESCENDANTS");
  // replace old file path to new file path with new folder name
  // const newPath = replaceLast(filePath, fileName, req.body.name);
  // await queries.editFolderNameById(req.body.id, req.body.name, newPath);
  // res.redirect(`${req.body["web-page-path"]}`);
}

// async function getAllChildrenIds(parentId) {
//   const childrenIdsArr = [];
//   const childFiles = await queries.getAllItemsByParentId(parentId);
//   childFiles.forEach((file) => {
//     file.id;
//   });
// }

// function that updates the path and the location of the file
// and its children when a file name is changed

async function updateFolderData(id) {
  let folderDepth = 0;
  const file = await queries.getFilesByFileId(id);
  while (parentId !== null) {}
  // update path
  // update location
  // check the level of path 0 = root 1 = level 1, 2 = level 2
  // to get level go up in parent Id then count n + 1 for each until parentId = null
}

async function updateFolderData(oldPath, newPath, idArr) {
  if (idArr.length === 0) {
    return;
  }
  const fileId = idArr.shift();
  const childrenIdsArr = await queries.getAllItemsByParentId(fileId);
  childrenIdsArr.forEach((file) => {
    idArr.push(file.id);
  });
  // /test111/test12/test12, /test12, [42, ]
  // function replaces last part of the old path with /test12 for id 42
  // check slashes that current Path has and do n+1 slash for each child
  // using the child's path, use the new child path to swap the 2nd child's old path
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
