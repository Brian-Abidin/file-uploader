const { body, validationResult } = require("express-validator");
const { Router } = require("express");
const passport = require("passport");
const usersController = require("../controller/usersController");
const passportController = require("../config/passport");
const { upload } = require("../config/multer");

const UsersRouter = Router();

UsersRouter.get("/", usersController.getIndex);
UsersRouter.get("/sign-up", usersController.getForm);
UsersRouter.get("/failure", usersController.getFailure);
UsersRouter.get("/log-out", passportController.logoutRequest);
UsersRouter.post(
  "/sign-up",
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),
  body("confirm-password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap = errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {});
      return res.status(404).render("failure", {
        errors: Object.values(errorMap)
      });
    }
    next();
  },
  passportController.encryptPassword
);
UsersRouter.post(
  "/log-in",
  // body("password")
  //   .isLength({ min: 5 })
  //   .withMessage("Password must be at least 5 characters long"),
  // body("confirm-password").custom((value, { req }) => {
  //   if (value !== req.body.password) {
  //     throw new Error("Password confirmation does not match password");
  //   }
  //   return true;
  // }),
  // (req, res, next) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     const errorMap = errors.array().reduce((acc, error) => {
  //       acc[error.path] = error.msg;
  //       return acc;
  //     }, {});
  //     res.status(404).render("failure", {
  //       errors: Object.values(errorMap)
  //     });
  //   }
  //   next();
  // },
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/failure",
    failureMessage: true
  })
);

UsersRouter.post("/upload", upload.single("image"), usersController.postUpload);
UsersRouter.post("/newfolder", usersController.postFolder);

module.exports = UsersRouter;
