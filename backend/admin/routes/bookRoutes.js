const express = require("express");

const bookController = require("../controllers/bookController");
const imageStorage = require("../../middlewares/imageStorage");
const bookValidator = require("../../validators/bookValidations/bookValidator");
const userAuthentication = require("../../middlewares/authToken");

const bookRouter = express.Router();

bookRouter.post(
  "/addBook",
  userAuthentication,
  imageStorage.bookImageUpload.single("bookImage"),
  bookValidator.addBook,
  bookController.addBook,
);
bookRouter.patch(
  "/editBook/:bookId",
  userAuthentication,
  imageStorage.bookImageUpload.single("bookImage"),
  bookController.editBook,
);
bookRouter.delete(
  "/deleteBook/:bookId",
  userAuthentication,
  bookController.deleteBook,
);
bookRouter.get(
  "/searchBookByName/:bookName",
  userAuthentication,
  bookController.searchBookByName,
);
// bookRouter.get(
//   "/searchBookByCategory/:categoryName",
//   userAuthentication,
//   bookController.searchBookByCategory,
// );
bookRouter.get(
  "/bookDetails/:bookId",
  userAuthentication,
  bookController.bookDetails,
);
bookRouter.get(
  "/borrowBooks/:userId/:bookId",
  userAuthentication,
  bookController.borrowBooks,
);
bookRouter.get(
  "/returnBook/:userId/:bookId",
  userAuthentication,
  bookController.returnBook,
);
bookRouter.post(
  "/toggleLikeBook/:bookId",
  userAuthentication,
  bookController.toggleLikeBook,
);
bookRouter.get("/getallBooks", userAuthentication, bookController.getallBooks);

bookRouter.get(
  "/getBooksByCategory/:categoryId",
  userAuthentication,
  bookController.getBooksByCategory,
);

bookRouter.get("/getTopPicks", userAuthentication, bookController.getTopPicks);

module.exports = bookRouter;
