const { Router } = require("express");
const pageController = require("../controller/pageController");

const pageRouter = Router();

pageRouter.post("/folders/:pageId/share", pageController.createShareableLink);
pageRouter.get("/public/share/:pageId", pageController.renderPublicPage);

module.exports = pageRouter;
