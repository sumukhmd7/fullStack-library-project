const db = require("../../db");
const { reviews } = require("../../drizzle/schemas/reviewSchema");

const { eq } = require("drizzle-orm");

const reviewLogger = require("../../utils/reviewLogger/reviewLogger");

// ADD REVIEW
const addReview = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    if (req.body.rating > 5 || req.body.rating <= 0) {
      reviewLogger.log("error", "Rating limit is 5");

      return res.status(401).send({
        success: false,
        message: "Rating limit is 5",
      });
    }

    await db.insert(reviews).values({
      review: req.body.review,
      rating: req.body.rating,
      userId: userId,
      bookId: bookId,
    });

    reviewLogger.log("info", "Review created!");

    res.status(201).send({
      success: true,
      message: "Review created!",
    });
  } catch (error) {
    reviewLogger.log("error", `Error: ${error.message}`);

    res.status(500).send({
      success: false,
      message: "Error",
      error: error.message,
    });
  }
};

// EDIT REVIEW
const editReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (req.body.rating) {
      if (req.body.rating > 5 || req.body.rating <= 0) {
        reviewLogger.log("error", "Rating limit is 5");

        return res.status(401).send({
          success: false,
          message: "Rating limit is 5",
        });
      }
    }

    const updatedReview = await db
      .update(reviews)
      .set({
        review: req.body.review,
        rating: req.body.rating,
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    reviewLogger.log("info", "Review is updated!");

    res.status(200).send({
      success: true,
      message: "Review is updated!",
      review: updatedReview[0],
    });
  } catch (error) {
    reviewLogger.log("error", `Error: ${error.message}`);

    res.status(500).send({
      success: false,
      message: "Error",
      error: error.message,
    });
  }
};

// DELETE REVIEW
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const deletedReview = await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning();

    reviewLogger.log("info", "Review is deleted!");

    res.status(200).send({
      success: true,
      message: "Review is deleted!",
      review: deletedReview[0],
    });
  } catch (error) {
    reviewLogger.log("error", `Error: ${error.message}`);

    res.status(500).send({
      success: false,
      message: "Error",
      error: error.message,
    });
  }
};

// ALL REVIEWS OF BOOK
const allReviewsOfBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviewData = await db
      .select({
        review: reviews.review,
        rating: reviews.rating,
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId));

    if (reviewData.length <= 0) {
      reviewLogger.log("error", "No review found!");

      return res.status(401).send({
        success: false,
        message: "No review found!",
      });
    }

    reviewLogger.log("info", "Reviews found");

    res.status(200).send({
      success: true,
      message: "Reviews found",
      review: reviewData,
    });
  } catch (error) {
    reviewLogger.log("error", `Error: ${error.message}`);

    res.status(500).send({
      success: false,
      message: "Error",
      error: error.message,
    });
  }
};

// EXPORT API
module.exports = {
  addReview,
  editReview,
  deleteReview,
  allReviewsOfBook,
};
