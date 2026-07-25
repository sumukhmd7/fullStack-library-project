import { useEffect, useState } from "react";
import axios from "axios";
import "./Borrowedbooks.css";
import { useNavigate } from "react-router-dom";

//-----GET ALL BORROWED BOOKS-----
const Borrowedbooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getBorrowedbookslist = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/admin/borrowBooksList",
          {
            withCredentials: true,
          },
        );

        console.log("Full response:", response.data);
        console.log("Books:", response.data.books);

        setBorrowedBooks(response.data.books);
      } catch (error) {
        console.log(error.response?.data);
        if (error.response?.status === 401) {
          navigate("/", { replace: true });
          return;
        }
      }
    };

    getBorrowedbookslist();
  }, []);

  // -------- GET IMAGE ---------

  const getImageUrl = (imagePath, updatedAt) => {
    const API_BASE_URL = "http://localhost:8000";
    if (!imagePath) return "";
    const version = updatedAt ? new Date(updatedAt).getTime() : imagePath;
    return `${API_BASE_URL}${imagePath}?v=${encodeURIComponent(version)}`;
  };

  return (
    <div className="borrowed-books-page">
      <h1>Borrowed Books</h1>

      <div className="borrowed-books-container">
        {borrowedBooks.length > 0 ? (
          borrowedBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <img
                src={`http://localhost:8000${book.bookImage}`}
                alt={book.bookName}
                className="book-card-image"
                onClick={() => {
                  setSelectedImage(getImageUrl(book.bookImage, book.updatedAt));
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder-book.png";
                }}
              />

              <div className="book-card-content">
                <h2>{book.bookName}</h2>

                <p>
                  <strong>Author:</strong> {book.bookAuthor}
                </p>

                <p>
                  <strong>Category:</strong> {book.bookCategory}
                </p>

                <p>
                  <strong>Cost:</strong> ₹{book.bookCost}
                </p>

                <span className="borrowed-status">Borrowed</span>
              </div>
            </div>
          ))
        ) : (
          <p>No borrowed books found</p>
        )}
      </div>

      {/* --- IMAGE POPUP MODAL --- */}
      {selectedImage && (
        <div
          className="borrowed-image-modal"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="borrowed-image-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>

            <img
              src={selectedImage}
              alt="Book"
              className="borrowed-popup-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrowedbooks;
