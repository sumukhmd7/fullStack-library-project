const { categories } = require("../../drizzle/schemas/categorySchema");
const { books } = require("../../drizzle/schemas/bookSchema");
const categoryLogger = require("../../utils/categoryLogger/categoryLogger");
const db = require("../../db");
const { eq, count } = require("drizzle-orm");

const redis = require("../../config/redisClient");

// ADD CATEGORY
const addCategory = async (req, res) => {
  try {
    await db.insert(categories).values({
      categoryName: req.body.categoryName,
    });

    await redis.del("categories:all");

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

    await redis.del("categories:all");

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

    await redis.del("categories:all");

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
const CACHE_KEY = "categories:all";
const CACHE_TTL = 3600; // seconds, tune as needed

const allCategories = async (req, res) => {
  try {
    const start = Date.now();
    // 1. Try Redis first
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      categoryLogger.info("All category (cache hit)");
      return res.status(200).send({
        success: true,
        message: "All category",
        categories: JSON.parse(cached),
      });
    }

    // 2. Cache miss -> hit DB
    const categoryData = await db
      .select({
        id: categories.id,
        categoryName: categories.categoryName,
        bookCount: count(books.id),
      })
      .from(categories)
      .leftJoin(books, eq(books.categoryId, categories.id))
      .groupBy(categories.id, categories.categoryName);

    // 3. Set Redis (ioredis positional args: key, value, "EX", seconds)
    await redis.set(CACHE_KEY, JSON.stringify(categoryData), "EX", CACHE_TTL);

    categoryLogger.info("All category (cache miss, DB hit)");

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
