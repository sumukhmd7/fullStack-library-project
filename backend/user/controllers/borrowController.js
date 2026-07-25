const db = require("../../db");

const { borrowedBooks } = require("../../drizzle/schemas/borrowedBooksSchema");
const { books } = require("../../drizzle/schemas/bookSchema");

const { eq, and, isNull } = require("drizzle-orm");

const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // from JWT

    // console.log("=== BORROW DEBUG ===");
    // console.log("bookId:", bookId, "| type:", typeof bookId);
    // console.log("userId:", userId);

    const result = await db.transaction(async (tx) => {
      // Lock the book row so two simultaneous borrow requests can't both succeed
      const bookData = await tx
        .select()
        .from(books)
        .where(eq(books.id, bookId))
        .for("update");

      if (!bookData.length) {
        throw new Error("BOOK_NOT_FOUND");
      }

      const book = bookData[0];

      if (book.bookStatus !== "available") {
        throw new Error("BOOK_NOT_AVAILABLE");
      }

      const borrowedAt = new Date();
      const dueDate = new Date(borrowedAt);
      dueDate.setDate(dueDate.getDate() + 7); // 7-day free borrow period

      const [newBorrow] = await tx
        .insert(borrowedBooks)
        .values({
          userId,
          bookId,
          borrowedAt,
          dueDate,
        })
        .returning();

      await tx
        .update(books)
        .set({ bookStatus: "borrowed" })
        .where(eq(books.id, bookId));

      return newBorrow;
    });

    return res.status(201).send({
      success: true,
      message: "Book borrowed successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "BOOK_NOT_FOUND") {
      return res.status(404).send({
        success: false,
        message: "Book not found",
      });
    }

    if (error.message === "BOOK_NOT_AVAILABLE") {
      return res.status(409).send({
        success: false,
        message: "Book is currently unavailable",
      });
    }

    console.error("Error borrowing book:", error);
    return res.status(500).send({
      success: false,
      message: "Error occurred while borrowing book",
    });
  }
};

const FINE_PER_DAY = 10;

const returnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // from JWT

    const result = await db.transaction(async (tx) => {
      // Find this user's active (not yet returned) borrow record for this book
      const borrowData = await tx
        .select()
        .from(borrowedBooks)
        .where(
          and(
            eq(borrowedBooks.bookId, bookId),
            eq(borrowedBooks.userId, userId),
            isNull(borrowedBooks.returnedAt),
          ),
        )
        .for("update");

      if (!borrowData.length) {
        throw new Error("BORROW_RECORD_NOT_FOUND");
      }

      const borrowRecord = borrowData[0];

      const returnedAt = new Date();
      const dueDate = new Date(borrowRecord.dueDate);

      let fine = 0;
      let daysLate = 0;

      if (returnedAt > dueDate) {
        const msLate = returnedAt - dueDate;
        daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24)); // ms → days, rounded up
        fine = daysLate * FINE_PER_DAY;
      }

      const [updatedBorrow] = await tx
        .update(borrowedBooks)
        .set({ returnedAt, fine })
        .where(eq(borrowedBooks.id, borrowRecord.id))
        .returning();

      await tx
        .update(books)
        .set({ bookStatus: "available" })
        .where(eq(books.id, bookId));

      return { ...updatedBorrow, daysLate };
    });

    return res.status(200).send({
      success: true,
      message:
        result.fine > 0
          ? `Book returned. A fine of ₹${result.fine} applies (${result.daysLate} day(s) late).`
          : "Book returned on time. Hope you enjoyed reading!",
      data: result,
    });
  } catch (error) {
    if (error.message === "BORROW_RECORD_NOT_FOUND") {
      return res.status(404).send({
        success: false,
        message: "No active borrow record found for this book",
      });
    }

    console.error("Error returning book:", error);
    return res.status(500).send({
      success: false,
      message: "Error occurred while returning book",
    });
  }
};

const getMyBorrowedBooks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const myBorrows = await db
      .select({
        borrowId: borrowedBooks.id,
        bookId: books.id,
        bookName: books.bookName,
        bookAuthor: books.bookAuthor,
        bookImage: books.bookImage,
        borrowedAt: borrowedBooks.borrowedAt,
        dueDate: borrowedBooks.dueDate,
        returnedAt: borrowedBooks.returnedAt,
        fine: borrowedBooks.fine,
      })
      .from(borrowedBooks)
      .innerJoin(books, eq(borrowedBooks.bookId, books.id))
      .where(
        and(eq(borrowedBooks.userId, userId), isNull(borrowedBooks.returnedAt)),
      );

    const now = new Date();

    // Add a "live" fine estimate for books still borrowed (not yet returned)
    const borrowedWithLiveFine = myBorrows.map((record) => {
      const dueDate = new Date(record.dueDate);
      const isOverdue = now > dueDate;

      let daysLate = 0;
      let currentFine = 0;
      let daysRemaining = 0;

      if (isOverdue) {
        const msLate = now - dueDate;
        daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24));
        currentFine = daysLate * FINE_PER_DAY;
      } else {
        const msRemaining = dueDate - now;
        daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
      }

      return {
        ...record,
        isOverdue,
        daysLate,
        currentFine,
        daysRemaining,
      };
    });

    return res.status(200).send({
      success: true,
      borrowedBooks: borrowedWithLiveFine,
    });
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    return res.status(500).send({
      success: false,
      message: "Error occurred while fetching borrowed books",
    });
  }
};

// EXPORT API
module.exports = {
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
};
