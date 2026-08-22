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

module.exports = {
  createNewFile
};
