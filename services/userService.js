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

module.exports = {
  createNewFile,
  getFiles
};
