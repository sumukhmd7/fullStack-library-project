const express = require("express");

const userAuthenticaion = require("../../middlewares/authToken");

const borrowController = require("../controllers/borrowController");

const borrowBooksRouter = express.Router();

borrowBooksRouter.post(
  "/executeBorrow/:bookId",
  userAuthenticaion,
  borrowController.borrowBook,
);

borrowBooksRouter.post(
  "/return/:bookId",
  userAuthenticaion,
  borrowController.returnBook,
);

borrowBooksRouter.get(
  "/myBorrowedBooks",
  userAuthenticaion,
  borrowController.getMyBorrowedBooks,
);

module.exports = borrowBooksRouter;
