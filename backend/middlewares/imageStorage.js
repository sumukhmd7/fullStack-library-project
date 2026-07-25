const multer = require("multer");
const path = require("path");

/**
 * Custom storage configuration generator
 * @param {string} destination - Subfolder in /uploads/
 * @param {string} filenamePrefix - Prefix for the file name (e.g., 'profile', 'book')
 * @param {boolean} isUnique - If true, appends Date.now() to ensure files never overwrite
 */
const imageStorageConfig = (destination, filenamePrefix, isUnique = false) =>
  multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join(__dirname, "..", "uploads", destination));
    },
    filename: (req, file, callback) => {
      const ext = path.extname(file.originalname);
      const userId = req.user ? req.user.id : "guest";

      let uniqueIdentifier;

      if (isUnique) {
        // Always appends timestamp (Used for Books/Admin uploads)
        // Output: book_123_1784589200000.jpg
        uniqueIdentifier = `${userId}_${Date.now()}`;
      } else {
        // Reuses user ID (Used for User Profile Pics -> Overwrites on disk to save space)
        // Output: profile_123.jpg
        uniqueIdentifier = userId;
      }

      callback(null, `${filenamePrefix}_${uniqueIdentifier}${ext}`);
    },
  });

// Define filter for image uploads
const imageFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("Only image files are supported"));
  }
};

// 1. Profile Uploads: Overwrites previous file for the same user ID (isUnique = false)
const profilePicUpload = multer({
  storage: imageStorageConfig("userProfilePics", "profile", false),
  fileFilter: imageFilter,
});

// 2. Book Uploads: Always creates a unique file with Date.now() (isUnique = true)
const bookImageUpload = multer({
  storage: imageStorageConfig("booksImages", "book", true),
  fileFilter: imageFilter,
});

module.exports = {
  profilePicUpload,
  bookImageUpload,
};
