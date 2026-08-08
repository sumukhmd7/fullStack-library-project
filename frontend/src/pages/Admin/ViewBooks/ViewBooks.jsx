import axios from "axios";
import { useState, useEffect } from "react";
import "./ViewBooks.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

// Full external URLs (e.g. from CSV-imported books using Open Library covers)
// should be used as-is. Only locally-uploaded images (relative paths like
// /uploads/booksImages/xyz.webp) need the backend host prefixed.
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return imagePath.startsWith("http")
    ? imagePath
    : `${API_BASE_URL}${imagePath}`;
};

const ViewBooks = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const getAllBooks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/books/getallBooks",
          { withCredentials: true },
        );

        console.log(response.data.books);

        setAllBooks(response.data.books);
      } catch (error) {
        console.log(error);
        if (error.response?.status === 401) {
          navigate("/", { replace: true });
          return;
        }
      }
    };
    getAllBooks();
  }, []);

  const filteredBooks = allBooks.filter((book) =>
    book.bookName.toLowerCase().includes(search.toLowerCase()),
  );

  //   {filteredBooks.map((book) => {
  //   console.log(book.bookImage);

  // console.log("bookImage value:", JSON.stringify(filteredBooks[0]?.bookImage));

  return (
    <div>
      <header className="admin-navbar">
        <div className="navbar-left">
          <button className="managebooks-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </header>
      <div className="view-books-page">
        {/* Header */}
        <div className="view-books-header">
          <h1>View Books</h1>
          <p>
            Browse all books available in the library and search by book name.
          </p>
        </div>

        {/* Search */}
        <div className="view-books-search-section">
          <input
            type="text"
            placeholder="🔍 Search book by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Books */}
        {filteredBooks.length === 0 ? (
          <div className="no-books">
            <h3>No books found.</h3>
          </div>
        ) : (
          <div className="view-books-books-grid">
            {filteredBooks.map((book) => (
              <div className="view-books-book-card" key={book.id}>
                <div className="view-books-book-image">
                  <img src={getImageUrl(book.bookImage)} alt={book.bookName} />
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

                  {/* <p>
                  <strong>Quantity:</strong> {book.quantity}
                </p> */}

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        book.bookStatus === "Available"
                          ? "status available"
                          : "status unavailable"
                      }
                    >
                      {book.bookStatus}
                    </span>
                  </p>

                  <p className="view-books-description">
                    {book.bookDescription}
                  </p>
                </div>

                {/* <div className="book-actions">
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBooks;
