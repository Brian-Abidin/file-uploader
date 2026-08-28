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

async function getFiles(userId) {
  console.log("working?");
  const items = await prisma.Item.findMany({
    where: {
      userId
    }
  });
  return items;
}

async function createNewFolder(
  name,
  type,
  path,
  size,
  location,
  parentId,
  parent,
  children,
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
      parent,
      children,
      userId
    }
  });
}

// async function deleteFolder(folderId) {}

module.exports = {
  createNewFile,
  getFiles,
  createNewFolder
};
