import { useState } from "react";
import axios from "axios";
import "./BookCard.css";

const BookCard = ({ book, onBorrowed }) => {
  const [showImage, setShowImage] = useState(null);
  const [likes, setLikes] = useState(book.bookLikes || 0);
  const [liked, setLiked] = useState(book.userLiked || false); // has this user liked it?
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    message: "",
  });

  const getImageUrl = (imagePath, updatedAt) => {
    const API_BASE_URL = "http://localhost:8000";
    if (!imagePath) return "";

    // Full external URLs (e.g. from CSV-imported books using Open Library covers)
    // should be used as-is. Only locally-uploaded images (relative paths like
    // /uploads/booksImages/xyz.webp) need the backend host prefixed.
    const isFullUrl = imagePath.startsWith("http");
    const baseImage = isFullUrl ? imagePath : `${API_BASE_URL}${imagePath}`;

    // Cache-busting query param only makes sense for locally-served images.
    // External hosts don't need it, and some may reject/ignore unknown query params.
    if (isFullUrl) return baseImage;

    const version = updatedAt ? new Date(updatedAt).getTime() : imagePath;
    return `${baseImage}?v=${encodeURIComponent(version)}`;
  };

  const handleLike = async () => {
    if (loading) return; // prevent double-click spam
    setLoading(true);

    // Optimistic update
    const prevLikes = likes;
    const prevLiked = liked;

    const nextLiked = !liked;
    const nextLikes = nextLiked ? likes + 1 : likes - 1;

    setLikes(nextLikes);
    setLiked(nextLiked);

    try {
      const res = await axios.post(
        `http://localhost:8000/books/toggleLikeBook/${book.id}`,
        {},
        { withCredentials: true },
      );
      // Sync with server truth
      setLikes(res.data.data.bookLikes);
      setLiked(res.data.data.userLiked);
    } catch (error) {
      // Rollback on failure
      setLikes(prevLikes);
      setLiked(prevLiked);
      console.error("Failed to like book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/books/executeBorrow/${book.id}`,
        {},
        { withCredentials: true },
      );

      setPopup({
        open: true,
        type: "success",
        message: response.data.message || "Book borrowed successfully!",
      });
      onBorrowed?.(book.id);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "This book is no longer available.";

      setPopup({
        open: true,
        type: "error",
        message: errorMessage,
      });

      if (error.response?.status === 401) {
        console.warn("User not authenticated while borrowing book.");
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div className="view-books-book-card">
        <div className="view-books-book-image">
          <img
            onClick={() => {
              setShowImage(getImageUrl(book.bookImage, book.updatedAt));
            }}
            src={getImageUrl(book.bookImage, book.updatedAt)}
            alt={book.bookName}
            loading="lazy"
          />
        </div>

        <div className="view-books-book-details">
          <h2>{book.bookName}</h2>
          <p>
            <strong>Author:</strong> {book.bookAuthor}
          </p>
          <p>
            <strong>Category:</strong> {book.categoryName}
          </p>
          <p>
            <strong>Price:</strong> ₹{book.bookCost}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                book.bookStatus === "available"
                  ? "status available"
                  : "status unavailable"
              }
            >
              {book.bookStatus}
            </span>
          </p>
          <p className="view-books-description">{book.bookDescription}</p>

          <button
            className={`reaction-button like-button ${liked ? "active" : ""}`}
            onClick={handleLike}
            disabled={loading}
          >
            ♥ <span>{likes}</span>
          </button>

          <button
            className="borrow-button"
            disabled={book.bookStatus !== "available"}
            onClick={handleBorrow}
          >
            {book.bookStatus === "available" ? "Borrow" : "Borrowed"}
          </button>
        </div>
      </div>

      {showImage && (
        <div className="image-modal" onClick={() => setShowImage(null)}>
          <div
            className="image-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="close-modal" onClick={() => setShowImage(null)}>
              ×
            </button>
            <img src={showImage} alt="Book" className="popup-image" />
          </div>
        </div>
      )}

      {popup.open && (
        <div
          className="book-popup-overlay"
          onClick={() => setPopup({ ...popup, open: false })}
        >
          <div
            className={`book-popup ${popup.type}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="book-popup-header">localhost:5173 says</div>
            <p className="book-popup-message">{popup.message}</p>
            <button
              className="book-popup-button"
              onClick={() => setPopup({ ...popup, open: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCard;
