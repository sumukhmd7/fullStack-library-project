const categorySchema = require("./categoryValSchema");

module.exports = {
  addCategory: (req, res, next) => {
    const result = categorySchema.addCategory.safeParse(req.body);

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    next();
  },
};
