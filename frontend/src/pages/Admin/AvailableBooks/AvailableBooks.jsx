import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import "./AvailableBooks.css";
import { useNavigate } from "react-router-dom";

const AvailableBooks = () => {
  const [availableBooks, setAvailableBooks] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const getAvailableBooks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/admin/availableBooksList",
          { withCredentials: true },
        );

        console.log("Full response:", response.data);
        console.log("Books:", response.data.books);

        setAvailableBooks(response.data.books);
      } catch (error) {
        console.log(error.response?.data);
        if (error.response?.status === 401) {
          navigate("/", { replace: true });
          return;
        }
      }
    };
    getAvailableBooks();
  }, []);

  return (
    <div className="borrowed-books-page">
      <h1> Available Books</h1>

      <div className="borrowed-books-container">
        {availableBooks.length > 0 ? (
          availableBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <img
                src={`http://localhost:8000${book.bookImage}`}
                alt={book.bookName}
                className="book-card-image"
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

                <span className="borrowed-status-available">Available</span>
              </div>
            </div>
          ))
        ) : (
          <p> There are currently no books available. </p>
        )}
      </div>
    </div>
  );
};

export default AvailableBooks;
