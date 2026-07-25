const bookSchema = require("./bookValSchema");

module.exports = {
  addBook: (req, res, next) => {
    console.log("req.body:", req.body);

    const result = bookSchema.addBook.safeParse(req.body);

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error.issues,
      });
    }

    next();
  },
};
