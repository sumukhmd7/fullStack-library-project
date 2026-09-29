const { users } = require("../../drizzle/schemas/userSchema");
const { books } = require("../../drizzle/schemas/bookSchema");
const { categories } = require("../../drizzle/schemas/categorySchema");

const { borrowedBooks } = require("../../drizzle/schemas/borrowedBooksSchema");

const { count } = require("drizzle-orm");
const { eq, ilike, or, sql, asc, and } = require("drizzle-orm");
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
    const pageParam = Number.parseInt(req.query.page, 10);
    const limitParam = Number.parseInt(req.query.limit, 10);

    const page = Number.isFinite(pageParam) ? Math.max(pageParam, 1) : 1;
    const limit = Math.min(
      Math.max(Number.isFinite(limitParam) ? limitParam : 20, 1),
      50,
    );
    const offset = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    // Escape LIKE wildcards so "50%" or "_" is treated literally
    const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
    const whereClause = search
      ? or(ilike(users.userName, pattern), ilike(users.userEmail, pattern))
      : undefined;

    // Page rows and total count run in parallel
    const [usersData, [{ total }]] = await Promise.all([
      db
        .select({
          id: users.id,
          userName: users.userName,
          userPhone: users.userPhone,
          userEmail: users.userEmail,
          userProfilePic: users.userProfilePic,
        })
        .from(users)
        .where(whereClause)
        .orderBy(asc(users.userName), asc(users.id)) // id breaks ties between same names
        .limit(limit)
        .offset(offset),

      db
        .select({ total: sql`count(*)`.mapWith(Number) })
        .from(users)
        .where(whereClause),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).send({
      success: true,
      message: "All Users Data",
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
      usersData,
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

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await db.delete(users).where(eq(users.id, userId));
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
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
  deleteUser,
};
