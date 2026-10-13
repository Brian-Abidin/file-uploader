const prisma = require("../lib/prisma");
const { generatePublicLink, verifyPublicLink } = require("../utils/publicLink");

async function createShareableLink(req, res) {
  const { pageId } = req.params;

  // validates for 30 minutes
  const publicLink = generatePublicLink(pageId, 30);
  res.json({ shareUrl: `${req.protocol}://${req.get("host")}${publicLink}` });
}

async function renderPublicPage(req, res) {
  const { pageId } = req.params;
  const { expires, token } = req.query;

  const isValid = verifyPublicLink(pageId, expires, token);

  if (!isValid) {
    return res.status(403).send("This link is invalid or has expired");
  }
  try {
    // fetch data from model
    // primsa get all the page data
    const pageData = { title: "public title" };
    res.render("publicView", { data: pageData });
  } catch (error) {
    res.status(500).render("failure", { errors: error });
  }
}

module.exports = {
  createShareableLink,
  renderPublicPage
};
