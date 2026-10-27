const prisma = require("../lib/prisma");
const queries = require("../services/userService");
const { generatePublicLink, verifyPublicLink } = require("../utils/publicLink");

function expiredInMinutes(expiresAt) {
  const diffInMinutes =
    Math.abs(expiresAt - Math.floor(Date.now())) / (1000 * 60);
  return Math.trunc(diffInMinutes);
}

async function createShareableLink(req, res) {
  const { pageId } = req.params;

  // validates for 30 minutes
  const publicLink = generatePublicLink(pageId, 30);
  res.json({ shareUrl: `${req.protocol}://${req.get("host")}${publicLink}` });
}

async function renderPublicPage(req, res) {
  const { pageId } = req.params;
  const { expires, token } = req.query;
  const files = await queries.getAllFilesByParentId(Number(pageId));
  const parentFile = await queries.getFileById(Number(pageId));
  const minutes = expiredInMinutes(expires);

  const isValid = verifyPublicLink(pageId, expires, token);

  console.log(pageId, files, "Pageidddddddddddd");
  if (!isValid) {
    return res.status(403).send("This link is invalid or has expired");
  }
  try {
    // fetch data from model
    // primsa get all the page data
    const pageData = { title: "public title" };
    return res.render("publicView", {
      data: pageData,
      files,
      parentName: parentFile.name,
      expiresAt: expires,
      minutes
    });
  } catch (error) {
    return res.status(500).render("failure", { errors: error });
  }
}

module.exports = {
  createShareableLink,
  renderPublicPage
};
