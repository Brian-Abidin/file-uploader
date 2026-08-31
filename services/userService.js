const prisma = require("../lib/prisma");

async function createNewFile(name, type, mediaType, path, size, userId) {
  await prisma.item.create({
    data: {
      name,
      type,
      mediaType,
      path,
      size,
      userId
    }
  });
}

async function getFilesByUserId(userId) {
  console.log("working?");
  const items = await prisma.Item.findMany({
    where: {
      userId,
      type: "FILE"
    }
  });
  return items;
}

async function getFilesByFileId(fileId) {
  console.log("working?");
  const items = await prisma.Item.findMany({
    where: {
      id: fileId,
      type: "FILE"
    }
  });
  return items;
}

async function getFolderById(folderId) {
  const folder = await prisma.Item.findUnique({
    where: {
      id: folderId
    }
  });
  return folder;
}

async function getParentPathByParentId(parentId) {
  const folder = await prisma.Item.findUnique({
    where: {
      id: parentId
    }
  });
  const parentPath = folder.path;
  return parentPath;
}

async function getUserByUsername(username) {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });
  return user;
}

async function countUserItemsByUserId(userId) {
  const count = await prisma.Item.count({
    where: {
      userId
    }
  });
  return count;
}

// async function getParentPathByPath(path){
//   const path = await prisma.Item.findFirst({
//     where: {

//     }
//   })
// }

async function getItemIdByPath(path) {
  const item = await prisma.Item.findFirst({
    where: {
      path
    }
  });
  return item.id;
}

async function addChild() {
  // get current directory
}

async function createNewFolder(
  name,
  type,
  path,
  size,
  location,
  parentId,
  userId
) {
  await prisma.item.create({
    data: {
      name,
      type,
      path,
      size,
      location,
      parentId,
      userId
    }
  });
}

// async function deleteFolder(folderId) {}

module.exports = {
  createNewFile,
  getFilesByUserId,
  getFilesByFileId,
  createNewFolder,
  getFolderById,
  getParentPathByParentId,
  getUserByUsername,
  countUserItemsByUserId,
  getItemIdByPath
};
