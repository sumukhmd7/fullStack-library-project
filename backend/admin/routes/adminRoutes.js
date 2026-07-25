const express = require("express");

const adminController = require("../controllers/adminController");
const userController = require("../../user/controllers/userController");
const authService = require("../../middlewares/authService");
const userAuthentication = require("../../middlewares/authToken");

const adminRouter = express.Router();

adminRouter.post("/adminLogin", authService.isAdmin, userController.loginUser);
adminRouter.get(
  "/DashBoard",
  userAuthentication,
  adminController.adminDashBoard,
);
adminRouter.get("/viewUsers", userAuthentication, adminController.viewUsers);
adminRouter.get(
  "/userDetails/:userId",
  userAuthentication,
  adminController.userDetails,
);
adminRouter.get(
  "/borrowBooksList",
  userAuthentication,
  adminController.borrowBooksList,
);

adminRouter.get(
  "/availableBooksList",
  userAuthentication,
  adminController.availableBooksList,
);

adminRouter.post("/logout", adminController.logoutadmin);

module.exports = adminRouter;
