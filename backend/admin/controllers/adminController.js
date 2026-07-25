const { users } = require("../../drizzle/schemas/userSchema");
const { books } = require("../../drizzle/schemas/bookSchema");
const { categories } = require("../../drizzle/schemas/categorySchema");

const { borrowedBooks } = require("../../drizzle/schemas/borrowedBooksSchema");

const { count } = require("drizzle-orm");
const { eq, ilike } = require("drizzle-orm");
const db = require("../../db");
const { success } = require("zod");

const adminDashBoard = async (req, res) => {
  try {
    const [usersData] = await db.select({ count: count() }).from(users);

    const [booksData] = await db.select({ count: count() }).from(books);

    const [categoriesData] = await db
      .select({ count: count() })
      .from(categories);

    return res.status(200).send({
      success: true,
      message: "Admin DashBoard",
      allUsers: usersData.count,
      allBooks: booksData.count,
      allCategories: categoriesData.count,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error!",
      error: error.message,
    });
  }
};

const viewUsers = async (req, res) => {
  try {
    const usersData = await db
      .select({
        id: users.id,
        userName: users.userName,
        userPhone: users.userPhone,
        userEmail: users.userEmail,
        userProfilePic: users.userProfilePic,
      })
      .from(users);

    return res.status(200).send({
      success: true,
      message: "All Users Data",
      usersData: usersData,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error!",
      error: error.message,
    });
  }
};

const userDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const [userData] = await db
      .select({
        id: users.id,
        userName: users.userName,
        userPhone: users.userPhone,
        userEmail: users.userEmail,
        userProfilePic: users.userProfilePic,
        userGender: users.userGender,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userData) {
      return res.status(400).send({
        success: false,
        message: "User not found!",
      });
    }

    // Second query — swap in the actual table/columns from myBorrowedBooks
    const borrowBooks = await db
      .select({
        bookId: borrowedBooks.bookId, // adjust names to match your schema
        bookName: books.bookName,
      })
      .from(borrowedBooks)
      .innerJoin(books, eq(books.id, borrowedBooks.bookId))
      .where(eq(borrowedBooks.userId, userId));

    return res.status(200).send({
      success: true,
      message: "User data found!",
      userData: { ...userData, borrowBooks },
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error!",
      error: error.message,
    });
  }
};

const borrowBooksList = async (req, res) => {
  try {
    const borrowBooks = await db
      .select({
        id: books.id,
        bookName: books.bookName,
        bookAuthor: books.bookAuthor,
        bookCategory: categories.categoryName,
        bookImage: books.bookImage,
        bookCost: books.bookCost,
      })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(ilike(books.bookStatus, "borrowed"));

    return res.status(200).send({
      success: true,
      message: "Borrow books list",
      books: borrowBooks,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error!",
      error: error.message,
    });
  }
};

const availableBooksList = async (req, res) => {
  try {
    const availableBooks = await db
      .select({
        id: books.id,
        bookName: books.bookName,
        bookAuthor: books.bookAuthor,
        bookCategory: categories.categoryName,
        bookImage: books.bookImage,
        bookCost: books.bookCost,
      })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(ilike(books.bookStatus, "available"));

    return res.status(200).send({
      success: true,
      message: "Available books list",
      books: availableBooks,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error!",
      error: error.message,
    });
  }
};

const logoutadmin = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

module.exports = {
  adminDashBoard,
  viewUsers,
  userDetails,
  borrowBooksList,
  logoutadmin,
  availableBooksList,
};
