import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import "./ViewBooks.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";
const PAGE_SIZE = 12; // books loaded per batch (backend allows up to 50)

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
  const [search, setSearch] = useState(""); // what the user is typing
  const [debouncedSearch, setDebouncedSearch] = useState(""); // what we send to the backend

  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Invisible marker at the bottom of the grid. When it scrolls into view,
  // we load the next batch.
  const loadMoreRef = useRef(null);

  // Drops responses from outdated requests (fast typing, or scrolling
  // while a new search is loading)
  const latestRequestRef = useRef(0);

  const navigate = useNavigate();

  // Fetches ONE batch of books.
  // No cursor  -> first page (replaces the list)
  // With cursor -> next page (added to the end of the list)
  const fetchBooks = useCallback(
    async ({ cursor = null, searchText = "" } = {}) => {
      const requestId = ++latestRequestRef.current;
      setIsLoading(true);

      try {
        const response = await axios.get(`${API_BASE_URL}/books/getallBooks`, {
          params: {
            limit: PAGE_SIZE,
            ...(cursor && { cursor }),
            ...(searchText && { search: searchText }),
          },
          withCredentials: true,
        });

        // A newer request has started since this one, so ignore this response
        if (requestId !== latestRequestRef.current) return;

        const pageBooks = response.data.books || [];

        setAllBooks((previousBooks) =>
          cursor ? [...previousBooks, ...pageBooks] : pageBooks,
        );
        setHasMore(Boolean(response.data.hasMore));
        setNextCursor(response.data.nextCursor || null);
      } catch (error) {
        console.log(error);
        if (error.response?.status === 401) {
          navigate("/", { replace: true });
        }
      } finally {
        if (requestId === latestRequestRef.current) setIsLoading(false);
      }
    },
    [navigate],
  );

  // Wait until the user stops typing (400ms) before searching.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load the first page on mount, and again whenever the search changes.
  useEffect(() => {
    fetchBooks({ searchText: debouncedSearch });
  }, [debouncedSearch, fetchBooks]);

  // Infinite scroll: when the marker near the bottom becomes visible,
  // load the next batch (only if there is one and nothing is loading).
  useEffect(() => {
    const marker = loadMoreRef.current;
    if (!marker) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && nextCursor) {
          fetchBooks({ cursor: nextCursor, searchText: debouncedSearch });
        }
      },
      { rootMargin: "200px" }, // start loading a little before the very bottom
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [hasMore, isLoading, nextCursor, debouncedSearch, fetchBooks]);

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
        {allBooks.length === 0 ? (
          <div className="no-books">
            <h3>{isLoading ? "Loading books..." : "No books found."}</h3>
          </div>
        ) : (
          <>
            <div className="view-books-books-grid">
              {allBooks.map((book) => (
                <div className="view-books-book-card" key={book.id}>
                  <div className="view-books-book-image">
                    <img
                      src={getImageUrl(book.bookImage)}
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
                </div>
              ))}
            </div>

            {/* Infinite scroll marker + loading message */}
            {hasMore && <div ref={loadMoreRef} style={{ height: 1 }} />}

            {isLoading && (
              <div className="no-books">
                <h3>Loading more books...</h3>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewBooks;
