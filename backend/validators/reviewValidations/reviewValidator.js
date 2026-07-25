const reviewSchema = require("./reviewValSchema");

module.exports = {
  addReview: (req, res, next) => {
    const result = reviewSchema.addReview.safeParse(req.body);

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    next();
  },
};
