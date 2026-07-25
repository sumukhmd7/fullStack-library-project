const express = require("express");

const categoryController = require("../controllers/categoryController");
const categoryValidation = require("../../validators/categoryValidations/categoryValidator");
const userAuthentication = require("../../middlewares/authToken");

const categoryRouter = express.Router();

categoryRouter.post(
  "/addCategory",
  userAuthentication,
  categoryValidation.addCategory,
  categoryController.addCategory,
);
categoryRouter.patch(
  "/editCategory/:categoryId",
  userAuthentication,
  categoryController.editCategory,
);
categoryRouter.delete(
  "/deleteCategory/:categoryId",
  userAuthentication,
  categoryController.deleteCategory,
);
categoryRouter.get(
  "/allCategories",
  userAuthentication,
  categoryController.allCategories,
);

module.exports = categoryRouter;
