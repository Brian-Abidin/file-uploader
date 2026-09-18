const prisma = require("../lib/prisma");

async function createNewFile(
  name,
  type,
  mediaType,
  path,
  size,
  location,
  userId,
  parentId
) {
  await prisma.item.create({
    data: {
      name,
      type,
      mediaType,
      path,
      size,
      location,
      userId,
      parentId
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

async function getFileById(id) {
  const file = await prisma.Item.findUnique({
    where: {
      id
    },
    include: {
      children: true
    }
  });
  return file;
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
async function getAllItemsByPath(path) {
  const items = await prisma.Item.findMany({
    where: {
      location: path,
      parentId: {
        not: null
      }
    }
  });
  return items;
}
async function getAllItemsByParentId(id) {
  const items = await prisma.Item.findMany({
    where: {
      parentId: id
    },
    include: {
      children: true
    }
  });
  return items;
}

async function addChild() {
  // get current directory
}

async function deleteFileById(id) {
  await prisma.Item.delete({
    where: {
      id
    }
  });
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

async function editFilePathById(id, newPath) {
  await prisma.Item.update({
    where: {
      id: Number(id)
    },
    data: {
      path: newPath
    }
  });
}

async function editFileLocationById(id, newLocation) {
  await prisma.Item.update({
    where: {
      id: Number(id)
    },
    data: {
      location: newLocation
    }
  });
}

// async function deleteFolder(folderId) {}

module.exports = {
  createNewFile,
  getFilesByUserId,
  getFilesByFileId,
  createNewFolder,
  getFileById,
  getParentPathByParentId,
  getUserByUsername,
  countUserItemsByUserId,
  getItemIdByPath,
  getAllItemsByPath,
  getAllItemsByParentId,
  deleteFileById,
  editFilePathById,
  editFileLocationById
};
