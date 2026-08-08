/**
 * Bulk import books from a CSV file.
 *
 * Usage:
 *   node importBooks.js path/to/books.csv
 *
 * CSV columns expected (header row required):
 *   book_name, book_description, book_author, category_name, book_image, book_cost, book_dislikes
 *
 * - category_name is resolved to categoryId via a DB lookup (case-insensitive).
 * - book_image is stored as-is (expects a full URL — e.g. Open Library covers).
 * - book_dislikes defaults to 0 if omitted.
 * - Everything else (id, likes, status, isActive, timestamps) uses your schema defaults,
 *   same as your addBook controller.
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync"); // npm install csv-parse

const db = require("../db"); // <-- adjust path to your drizzle db instance
const { books } = require("../drizzle/schemas/bookSchema");
const { categories } = require("../drizzle/schemas/categorySchema"); // <-- adjust path to your schema file
const { eq } = require("drizzle-orm");
const redis = require("../config/redisClient"); // same cache invalidation as addBook

async function importBooks(csvPath) {
  const fileContent = fs.readFileSync(path.resolve(csvPath), "utf-8");

  const rows = parse(fileContent, {
    columns: true, // use header row as keys
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${rows.length} rows in CSV`);

  // Preload all categories once, avoid a DB query per row
  const allCategories = await db.select().from(categories);
  const categoryMap = new Map(
    allCategories.map((c) => [c.categoryName.toLowerCase().trim(), c.id]),
  );
  // ^ adjust `c.categoryName` to match your actual categories schema column name

  const results = { success: 0, failed: [] };

  for (const [index, row] of rows.entries()) {
    const rowNum = index + 2; // +2 because row 1 is header, humans count from 1

    try {
      const categoryId = categoryMap.get(
        row.category_name?.toLowerCase().trim(),
      );

      if (!categoryId) {
        throw new Error(`Category "${row.category_name}" not found in DB`);
      }

      if (
        !row.book_name ||
        !row.book_description ||
        !row.book_author ||
        !row.book_image ||
        !row.book_cost
      ) {
        throw new Error("Missing a required field");
      }

      await db.insert(books).values({
        bookName: row.book_name,
        bookDescription: row.book_description,
        bookAuthor: row.book_author,
        categoryId,
        bookImage: row.book_image,
        bookCost: parseInt(row.book_cost, 10),
        bookDislikes: row.book_dislikes ? parseInt(row.book_dislikes, 10) : 0,
      });

      results.success++;
      console.log(`Row ${rowNum}: ✅ "${row.book_name}" inserted`);
    } catch (err) {
      results.failed.push({
        row: rowNum,
        book: row.book_name,
        error: err.message,
      });
      console.log(
        `Row ${rowNum}: ❌ "${row.book_name}" failed — ${err.message}`,
      );
    }
  }

  // Invalidate cache once at the end, not per row
  await redis.del("books:all");

  console.log("\n--- Import complete ---");
  console.log(`Success: ${results.success}`);
  console.log(`Failed: ${results.failed.length}`);
  if (results.failed.length) {
    console.log("Failures:", JSON.stringify(results.failed, null, 2));
  }

  process.exit(0);
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node importBooks.js path/to/books.csv");
  process.exit(1);
}

importBooks(csvPath).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
