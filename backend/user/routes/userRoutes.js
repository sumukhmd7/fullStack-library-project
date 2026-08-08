const express = require("express");

const userController = require("../controllers/userController");
const { isUser } = require("../../middlewares/authService");
const userValidator = require("../../validators/userValidations/userValidator");
const imageStorage = require("../../middlewares/imageStorage");
const userAuthentication = require("../../middlewares/authToken");

const { loginLimiter } = require("../../middlewares/routeSpecificRateLimiter");
const { signupLimiter } = require("../../middlewares/routeSpecificRateLimiter");
const {
  forgotPasswordLimiter,
} = require("../../middlewares/routeSpecificRateLimiter");

const userRouter = express.Router();

userRouter.post(
  "/signupUser",
  signupLimiter,
  userValidator.signupUserValidation,
  userController.signupUser,
);
userRouter.post(
  "/userLogin",
  // loginLimiter,
  isUser,
  userValidator.userLoginValidation,
  userController.loginUser,
);
userRouter.post(
  "/forgetPassword",
  forgotPasswordLimiter,
  userController.forgetPassword,
);
userRouter.post(
  "/resetPassword/:userId/:token",
  loginLimiter,
  userValidator.resetPasswordValidation,
  userController.resetPassword,
);
userRouter.post(
  "/setNewPassword/:userId",
  userAuthentication,
  userValidator.setNewPasswordValidation,
  userController.setNewPassword,
);

userRouter.get("/profile", userAuthentication, userController.getUserProfile);

userRouter.get(
  "/viewProfile/:userId",
  userAuthentication,
  userController.viewProfile,
);
userRouter.patch(
  "/editProfile/:userId",
  userAuthentication,
  imageStorage.profilePicUpload.single("userProfilePic"),
  userController.editProfile,
);
userRouter.get(
  "/userDashBoard",
  userAuthentication,
  userController.userDashBoard,
);

userRouter.post("/logout", userAuthentication, userController.logoutUser);

module.exports = userRouter;
