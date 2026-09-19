import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyBorrowed.css";

const API_BASE_URL = "http://localhost:8000";

// Full external URLs (e.g. from CSV-imported books using Open Library
// covers) are used as-is. Only locally-uploaded images (relative paths
// like /uploads/booksImages/xyz.webp) need the backend host prefixed.
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return imagePath.startsWith("http")
    ? imagePath
    : `${API_BASE_URL}${imagePath}`;
};

const MyBorrowed = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null); // tracks which book is mid-return
  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    message: "",
  });
  const navigate = useNavigate();

  const fetchBorrowedBooks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/books/myBorrowedBooks",
        { withCredentials: true },
      );
      setBorrowedBooks(response.data.borrowedBooks);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/", { replace: true });
      } else {
        console.error("Failed to fetch borrowed books:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleReturn = async (bookId) => {
    setReturningId(bookId);
    try {
      const response = await axios.post(
        `http://localhost:8000/books/return/${bookId}`,
        {},
        { withCredentials: true },
      );

      const { fine, daysLate } = response.data.data;

      if (fine > 0) {
        setPopup({
          open: true,
          type: "error",
          message: `Please pay a fine of ₹${fine}.\n\nBill details:\n- Days late: ${daysLate}\n- Fine per day: ₹10\n- Total fine: ₹${fine}`,
        });
      } else {
        setPopup({
          open: true,
          type: "success",
          message: "Hope you enjoyed reading! Happy reading 📚",
        });
      }

      fetchBorrowedBooks();
    } catch (error) {
      console.error("Failed to return book:", error);
      setPopup({
        open: true,
        type: "error",
        message: "Something went wrong while returning the book.",
      });
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return <div className="my-borrowed-loading">Loading...</div>;
  }

  return (
    <div className="my-borrowed-page">
      <header className="my-borrowed-header">
        <button className="my-borrowed-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>My Borrowed Books</h1>
        <p>Track your due dates, fines, and returns.</p>
      </header>

      {borrowedBooks.length === 0 ? (
        <div className="my-borrowed-empty">
          <h3>You haven't borrowed any books yet.</h3>
        </div>
      ) : (
        <div className="my-borrowed-grid">
          {borrowedBooks.map((record) => (
            <div key={record.borrowId} className="my-borrowed-card">
              <div className="my-borrowed-cover">
                {record.bookImage ? (
                  <img
                    src={getImageUrl(record.bookImage)}
                    alt={record.bookName}
                  />
                ) : (
                  record.bookName.charAt(0)
                )}
              </div>

              <div className="my-borrowed-details">
                <h2>{record.bookName}</h2>
                <p className="my-borrowed-author">{record.bookAuthor}</p>

                <p className="my-borrowed-date">
                  <strong>Borrowed:</strong>{" "}
                  {new Date(record.borrowedAt).toLocaleDateString()}
                </p>
                <p className="my-borrowed-date">
                  <strong>Due:</strong>{" "}
                  {new Date(record.dueDate).toLocaleDateString()}
                </p>

                {record.isOverdue ? (
                  <span className="my-borrowed-badge overdue">
                    Overdue by {record.daysLate} day
                    {record.daysLate !== 1 ? "s" : ""} — Fine: ₹
                    {record.currentFine}
                  </span>
                ) : (
                  <span className="my-borrowed-badge on-time">
                    {record.daysRemaining} day
                    {record.daysRemaining !== 1 ? "s" : ""} remaining
                  </span>
                )}

                <button
                  className="my-borrowed-return-btn"
                  onClick={() => handleReturn(record.bookId)}
                  disabled={returningId === record.bookId}
                >
                  {returningId === record.bookId
                    ? "Returning..."
                    : "Return Book"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {popup.open && (
        <div
          className="borrow-popup-overlay"
          onClick={() => setPopup({ ...popup, open: false })}
        >
          <div
            className={`borrow-popup ${popup.type}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="borrow-popup-header">localhost:5173 says</div>
            <p className="borrow-popup-message">{popup.message}</p>
            <button
              className="borrow-popup-button"
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

export default MyBorrowed;
