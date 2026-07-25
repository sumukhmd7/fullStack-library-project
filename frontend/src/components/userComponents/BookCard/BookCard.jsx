import { useState } from "react";
import axios from "axios";
import "./BookCard.css";

const BookCard = ({ book, onBorrowed }) => {
  const [showImage, setShowImage] = useState(null);
  const [likes, setLikes] = useState(book.bookLikes || 0);
  const [liked, setLiked] = useState(book.userLiked || false); // has this user liked it?
  const [loading, setLoading] = useState(false);

  const getImageUrl = (imagePath, updatedAt) => {
    const API_BASE_URL = "http://localhost:8000";
    if (!imagePath) return "";
    const version = updatedAt ? new Date(updatedAt).getTime() : imagePath;
    return `${API_BASE_URL}${imagePath}?v=${encodeURIComponent(version)}`;
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

      alert(response.data.message);
      onBorrowed(book.id);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/", { replace: true });
      } else if (error.response?.status === 409) {
        alert("This book is no longer available.");
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
            src={`http://localhost:8000${book.bookImage}`}
            alt={book.bookName}
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
    </div>
  );
};

export default BookCard;
