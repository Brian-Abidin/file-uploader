const { body, validationResult } = require("express-validator");
const { Router } = require("express");
const passport = require("passport");
const usersController = require("../controller/usersController");
const passportController = require("../config/passport");

const UsersRouter = Router();

UsersRouter.get("/", usersController.getIndex);
UsersRouter.get("/sign-up", usersController.getForm);
UsersRouter.get("/failure", usersController.getFailure);
UsersRouter.get("/log-out", passportController.logoutRequest);
UsersRouter.post("/sign-up", passportController.encryptPassword);
UsersRouter.post(
  "/log-in",
  body("password").isLength({ min: 5 }),
  body("confirm-password").custom(
    (value, { req }) => value === req.body.password
  ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("failure", {
        errors: JSON.stringify(errors)
      });
    }
    next();
  },
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/failure"
  })
);

module.exports = UsersRouter;
