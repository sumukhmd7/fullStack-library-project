const { categories } = require("../../drizzle/schemas/categorySchema");
const { books } = require("../../drizzle/schemas/bookSchema");
const categoryLogger = require("../../utils/categoryLogger/categoryLogger");
const db = require("../../db");
const { eq, count } = require("drizzle-orm");

// ADD CATEGORY
const addCategory = async (req, res) => {
  try {
    await db.insert(categories).values({
      categoryName: req.body.categoryName,
    });

    categoryLogger.info("Category created!");

    res.status(201).send({
      success: true,
      message: "Category created!",
    });
  } catch (error) {
    categoryLogger.error(`Error: ${error.message}`);

    res.status(500).send({
      success: false,
      message: "Error!",
      error: error.message,
    });
  }
};

// EDIT CATEGORY
const editCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const updatedCategory = await db
      .update(categories)
      .set({
        categoryName: req.body.categoryName,
      })
      .where(eq(categories.id, categoryId))
      .returning();

    if (!updatedCategory.length) {
      return res.status(400).send({
        success: false,
        message: "Category not Found",
      });
    }

    categoryLogger.info("Category edited!");

    res.status(200).send({
      success: true,
      message: "Category edited!",
    });
  } catch (error) {
    categoryLogger.error(`Error: ${error.message}`);

    res.status(500).send({
      success: false,
      message: "Error!",
      error: error.message,
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deletedCategory = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();

    if (!deletedCategory.length) {
      return res.status(400).send({
        success: false,
        message: "Category not Found",
      });
    }

    categoryLogger.info("Category deleted");

    res.status(200).send({
      success: true,
      message: "Category deleted!",
    });
  } catch (error) {
    categoryLogger.error(`Error: ${error.message}`);

    res.status(500).send({
      success: false,
      message: "Error!",
      error: error,
    });
  }
};

// GET ALL CATEGORY
const allCategories = async (req, res) => {
  try {
    const categoryData = await db
      .select({
        id: categories.id,
        categoryName: categories.categoryName,
        bookCount: count(books.id),
      })
      .from(categories)
      .leftJoin(books, eq(books.categoryId, categories.id))
      .groupBy(categories.id, categories.categoryName);

    categoryLogger.info("All category");

    res.status(200).send({
      success: true,
      message: "All category",
      categories: categoryData,
    });
  } catch (error) {
    categoryLogger.error(`Error: ${error.message}`);

    res.status(500).send({
      success: false,
      message: "Error!",
      error: error.message,
    });
  }
};

// EXPORT
module.exports = {
  addCategory,
  editCategory,
  deleteCategory,
  allCategories,
};
