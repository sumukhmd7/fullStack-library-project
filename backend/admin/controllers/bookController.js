const db = require("../../db");

const { books } = require("../../drizzle/schemas/bookSchema");
const { users } = require("../../drizzle/schemas/userSchema");
const { categories } = require("../../drizzle/schemas/categorySchema");
const { reviews } = require("../../drizzle/schemas/reviewSchema");

const { eq, ilike, and, desc } = require("drizzle-orm");

const bookLogger = require("../../utils/bookLogger/bookLogger");
const userLogger = require("../../utils/userLogger/userLogger");

const addBook = async (req, res) => {
  console.log("✅ Entered addBook controller");
  console.log(req.body);
  try {
    const bookImage = `/uploads/booksImages/${req.file.filename}`;

    // const isCategoryExist = await db
    //   .select()
    //   .from(categories)
    //   .where(eq(categories.id, req.body.categoryId));

    // if (!isCategoryExist.length) {
    //   bookLogger.error("Category not exist in database");
    //   return res.status(404).send({
    //     success: false,
    //     message: "Category not exist in database",
    //   });
    // }

    const newBook = await db
      .insert(books)
      .values({
        bookName: req.body.bookName,
        bookDescription: req.body.bookDescription,
        bookAuthor: req.body.bookAuthor,
        // bookCategory: req.body.bookCategory,
        categoryId: req.body.categoryId,
        bookImage,
        bookCost: req.body.bookCost,
      })
      .returning();

    bookLogger.info("Book added successfully");

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: newBook[0],
    });
  } catch (error) {
    bookLogger.error(`Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Unable to add book",
      error: error.message,
    });
  }
};

const editBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    // 1. Prepare fields to update
    const updatePayload = {
      bookStatus: req.body.bookStatus,
      bookName: req.body.bookName,
      bookDescription: req.body.bookDescription,
      bookAuthor: req.body.bookAuthor,
      categoryId: req.body.categoryId,
      bookCost: req.body.bookCost,
    };

    // 2. Only add bookImage if a new file was actually uploaded
    if (req.file) {
      updatePayload.bookImage = `/uploads/booksImages/${req.file.filename}`;
    }

    // 3. Execute update in Drizzle
    const updatedBook = await db
      .update(books)
      .set(updatePayload)
      .where(eq(books.id, bookId))
      .returning();

    if (!updatedBook.length) {
      bookLogger.error("Book not found!");
      return res.status(404).send({
        success: false,
        message: "Book not found!",
      });
    }

    bookLogger.info("Book updated!");

    return res.status(200).send({
      success: true,
      message: "Book updated!",
      bookData: updatedBook[0],
    });
  } catch (error) {
    bookLogger.error(`Error in editBook: ${error.message}`);
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const deleted = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();

    if (!deleted.length) {
      bookLogger.error("Book not found!");
      return res.status(404).send({
        success: false,
        message: "Book not found!",
      });
    }

    bookLogger.info("Book deleted!");

    res.status(200).send({
      success: true,
      message: "Book deleted!",
      data: deleted[0],
    });
  } catch (error) {
    bookLogger.error(error.message);
    res.status(500).send({ success: false });
  }
};

const searchBookByName = async (req, res) => {
  try {
    const { bookName } = req.params;

    const data = await db
      .select({
        bookName: books.bookName,
        bookImage: books.bookImage,
      })
      .from(books)
      .where(ilike(books.bookName, `${bookName}%`));

    if (!data.length) {
      return res.status(400).send({
        success: false,
        message: "Book not found!",
      });
    }

    res.status(200).send({
      success: true,
      bookFound: data,
    });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

const borrowBooks = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    const userData = await db.select().from(users).where(eq(users.id, userId));

    const bookData = await db.select().from(books).where(eq(books.id, bookId));

    if (!userData.length || !bookData.length) {
      return res.status(400).send({
        success: false,
        message: "User or Book not found",
      });
    }

    const user = userData[0];
    const book = bookData[0];

    if (user.borrowBooks.length >= 2) {
      return res.status(400).send({
        success: false,
        message: "Return book first",
      });
    }

    if (book.bookStatus !== "available") {
      return res.status(400).send({
        success: false,
        message: "Book already borrowed",
      });
    }

    await db
      .update(books)
      .set({
        currentOwner: userId,
        bookStatus: "not available",
      })
      .where(eq(books.id, bookId));

    await db
      .update(users)
      .set({
        borrowBooks: [...user.borrowBooks, book.bookName],
      })
      .where(eq(users.id, userId));

    res.status(200).send({
      success: true,
      message: "Book borrowed successfully",
    });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

const bookDetails = async (req, res) => {
  try {
    const { bookId } = req.params;

    console.log("========== DEBUG ==========");
    console.log("req.params:", req.params);
    console.log("req.body:", req.body);
    console.log("req.query:", req.query);
    console.log("bookId:", bookId);
    console.log("===========================");

    const bookData = await db.select().from(books).where(eq(books.id, bookId));
    console.log("bookId:", bookId);
    console.log("req.params:", req.params);
    console.log("req.body:", req.body);

    if (!bookData.length) {
      bookLogger.error("Book not found!");
      return res.status(404).send({
        success: false,
        message: "Book not found!",
      });
    }

    const book = bookData[0];

    const isAvailable =
      book.bookStatus === "available" ? "Available" : "not available";

    const reviewData = await db
      .select({
        rating: reviews.rating,
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId));

    const totalRating = reviewData.reduce(
      (sum, review) => sum + review.rating,
      0,
    );

    const averageRating =
      reviewData.length > 0 ? totalRating / reviewData.length : 0;

    bookLogger.info("Book details found!");

    res.status(200).send({
      success: true,
      message: "Book details found",
      isAvailable,
      bookData: book,
      averageRating,
    });
  } catch (error) {
    bookLogger.error(`Error: ${error.message}`);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const getallBooks = async (req, res) => {
  try {
    // const allBooks = await db.select().from(books);
    // .where(and(eq(books.bookStatus, "available"), eq(books.isActive, true)));

    const allBooks = await db
      .select({
        id: books.id,
        bookName: books.bookName,
        bookDescription: books.bookDescription,
        bookAuthor: books.bookAuthor,
        categoryId: books.categoryId,
        categoryName: categories.categoryName,
        bookImage: books.bookImage,
        bookStatus: books.bookStatus,
        bookCost: books.bookCost,
        bookLikes: books.bookLikes,
        likeByUsers: books.likeByUsers,
        bookDislikes: books.bookDislikes,
        // currentOwner: books.currentOwner,
        isActive: books.isActive,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
      })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id));

    const userId = req.user?.userId; // optional chaining in case route isn't auth-protected
    const booksWithLikeStatus = allBooks.map((book) => ({
      ...book,
      userLiked: userId ? book.likeByUsers?.includes(userId) || false : false,
    }));

    return res.status(200).send({
      success: true,
      totalBooks: allBooks.length,
      books: allBooks,
    });
  } catch (error) {
    console.log(error.message);
    console.error("full stack error", error);

    return res.status(500).send({
      success: false,
      message: "Error while fetching books",
      error: error.message,
    });
  }
};

const returnBook = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    const userData = await db.select().from(users).where(eq(users.id, userId));

    const bookData = await db.select().from(books).where(eq(books.id, bookId));

    if (!userData.length || !bookData.length) {
      bookLogger.error("User or Book data not found!");
      return res.status(404).send({
        success: false,
        message: "User or Book data not found!",
      });
      alert("User or Book data not found!");
    }

    const user = userData[0];
    const book = bookData[0];

    if (!user.borrowBooks.includes(book.bookName)) {
      bookLogger.error("You not owned book!");
      return res.status(400).send({
        success: false,
        message: "You not owned book!",
      });
    }

    const updatedBorrowBooks = user.borrowBooks.filter(
      (name) => name !== book.bookName,
    );

    await db
      .update(users)
      .set({
        borrowBooks: updatedBorrowBooks,
      })
      .where(eq(users.id, userId));

    await db
      .update(books)
      .set({
        bookStatus: "available",
        currentOwner: null,
      })
      .where(eq(books.id, bookId));

    bookLogger.info("Thanks for returning book!");

    res.status(200).send({
      success: true,
      message: "Thanks for returning book!",
    });
  } catch (error) {
    bookLogger.error(`Error occur: ${error.message}`);
    res.status(500).send({
      success: false,
      message: "Error occur",
    });
  }
};

const toggleLikeBook = async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT
    const { bookId } = req.params;

    const result = await db.transaction(async (tx) => {
      const bookData = await tx
        .select()
        .from(books)
        .where(eq(books.id, bookId))
        .for("update"); // locks this row until the transaction finishes

      if (!bookData.length) {
        throw new Error("BOOK_NOT_FOUND");
      }

      const book = bookData[0];

      let likeByUsers = book.likeByUsers || [];
      let bookLikes = book.bookLikes || 0;
      let userLiked;

      if (!likeByUsers.includes(userId)) {
        likeByUsers.push(userId);
        bookLikes += 1;
        userLiked = true;

        bookLogger.info(`User ${userId} liked book ${bookId}`);
      } else {
        likeByUsers = likeByUsers.filter((id) => id !== userId);
        bookLikes -= 1;
        userLiked = false;

        bookLogger.info(`User ${userId} unliked book ${bookId}`);
      }

      await tx
        .update(books)
        .set({ likeByUsers, bookLikes })
        .where(eq(books.id, bookId));

      return { bookLikes, userLiked };
    });

    return res.status(200).send({
      success: true,
      message: result.userLiked ? "Book liked" : "Book unliked",
      data: result,
    });
  } catch (error) {
    if (error.message === "BOOK_NOT_FOUND") {
      bookLogger.error("Book data not found!");
      return res.status(404).send({
        success: false,
        message: "Book data not found!",
      });
    }

    bookLogger.error(`Error occur: ${error.message}`);
    return res.status(500).send({
      success: false,
      message: "Error occur",
    });
  }
};

// const searchBookByCategory = async (req, res) => {
//   try {
//     // Taking categoryName from params
//     const { categoryId } = req.params;

//     // Check if category exists
//     const isCategoryExist = await db
//       .select()
//       .from(categories)
//       .where(eq(categories.categoryName, categoryName));

//     if (!isCategoryExist.length) {
//       bookLogger.error("Category not exist in database");

//       return res.status(404).send({
//         success: false,
//         message: "Category not exist in database",
//       });
//     }

//     // Get books by category (only name + image)
//     const bookSearchData = await db
//       .select({
//         bookName: books.bookName,
//         bookImage: books.bookImage,
//       })
//       .from(books)
//       .where(eq(books.bookCategory, categoryName));

//     bookLogger.info("Book search data found!");

//     res.status(200).send({
//       success: true,
//       message: "Book search data found!",
//       bookData: bookSearchData,
//     });
//   } catch (error) {
//     bookLogger.error(`Error: ${error.message}`);

//     res.status(500).json({
//       success: false,
//       message: "Error",
//       error: error.message,
//     });
//   }
// };

// controller
const getBooksByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const result = await db
      .select({
        id: books.id,
        bookName: books.bookName,
        bookDescription: books.bookDescription,
        bookAuthor: books.bookAuthor,
        bookImage: books.bookImage,
        bookStatus: books.bookStatus,
        bookCost: books.bookCost,
        categoryId: categories.id,
        categoryName: categories.categoryName,
      })
      .from(books)
      .innerJoin(categories, eq(books.categoryId, categories.id))
      .where(and(eq(books.categoryId, categoryId), eq(books.isActive, true)));

    res.status(200).send({
      success: true,
      message: "Book search data found!",
      books: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch books by category",
      error: error.message,
    });
  }
};

const getTopPicks = async (req, res) => {
  try {
    const topPicks = await db
      .select({
        id: books.id,
        bookName: books.bookName,
        bookAuthor: books.bookAuthor,
        bookImage: books.bookImage,
        bookLikes: books.bookLikes,
      })
      .from(books)
      .where(eq(books.isActive, true))
      .orderBy(desc(books.bookLikes))
      .limit(4);

    return res.status(200).send({
      success: true,
      topPicks: topPicks,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Error fetching top picks" });
  }
};

module.exports = {
  addBook,
  editBook,
  deleteBook,
  searchBookByName,
  // searchBookByCategory,
  bookDetails,
  borrowBooks,
  returnBook,
  // likeDislikeBook,
  getallBooks,
  getBooksByCategory,
  toggleLikeBook,
  getTopPicks,
};
