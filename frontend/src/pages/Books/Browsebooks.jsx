import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import BookCard from "../../components/userComponents/BookCard/BookCard.jsx";
import "./Browsebooks.css";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 12;

const Browsebooks = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();

  const fetchBooksPage = useCallback(
    async (cursor = null, append = false, searchText = "") => {
      if (activeCategoryId !== "All") return;

      setIsLoadingMore(true);
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
        if (cursor) params.set("cursor", cursor);
        if (searchText.trim()) params.set("search", searchText.trim());

        const response = await axios.get(
          `http://localhost:8000/books/getallBooks?${params.toString()}`,
          { withCredentials: true },
        );

        const pageBooks = response.data.books || [];
        const newCursor = response.data.nextCursor || null;

        if (append) {
          setAllBooks((prev) => [...prev, ...pageBooks]);
          setDisplayedBooks((prev) => [...prev, ...pageBooks]);
        } else {
          setAllBooks(pageBooks);
          setDisplayedBooks(pageBooks);
        }

        setNextCursor(newCursor);
        setHasMore(Boolean(response.data.hasMore));
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/", { replace: true });
        } else {
          console.error("Failed to fetch books:", error);
        }
      } finally {
        setIsLoadingMore(false);
      }
    },
    [activeCategoryId, navigate],
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/admin/allCategories",
          { withCredentials: true },
        );
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
    fetchBooksPage();
  }, [fetchBooksPage]);

  useEffect(() => {
    if (activeCategoryId !== "All") return;

    if (!search.trim()) {
      setNextCursor(null);
      setHasMore(true);
      fetchBooksPage();
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchBooksPage(null, false, search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, activeCategoryId, fetchBooksPage]);

  useEffect(() => {
    if (activeCategoryId !== "All") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (
          firstEntry?.isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          nextCursor
        ) {
          fetchBooksPage(nextCursor, true);
        }
      },
      { rootMargin: "220px" },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [activeCategoryId, fetchBooksPage, hasMore, isLoadingMore, nextCursor]);

  const handleAllClick = () => {
    setActiveCategoryId("All");
    setDropdownOpen(false);
    setNextCursor(null);
    setHasMore(true);
    fetchBooksPage();
  };

  const handleCategorySelect = async (categoryId) => {
    setActiveCategoryId(categoryId);
    setDropdownOpen(false);
    setNextCursor(null);
    setHasMore(false);
    try {
      const response = await axios.get(
        `http://localhost:8000/books/getBooksByCategory/${categoryId}`,
        { withCredentials: true },
      );
      setDisplayedBooks(response.data.books);
    } catch (error) {
      console.error("Failed to fetch books by category:", error);
    }
  };

  // Search always filters whatever is currently displayed
  const filteredBooks = displayedBooks.filter((book) =>
    book.bookName.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCategoryName =
    activeCategoryId === "All"
      ? "All"
      : categories.find((c) => c.id === activeCategoryId)?.categoryName ||
        "All";

  const handleBookBorrowed = (bookId) => {
    const updateStatus = (books) =>
      books.map((book) =>
        book.id === bookId ? { ...book, bookStatus: "borrowed" } : book,
      );

    setAllBooks(updateStatus(allBooks));
    setDisplayedBooks(updateStatus(displayedBooks));
  };

  return (
    <div className="browse-books-page">
      <header className="browse-books-header-container">
        <div className="browsebooks-navbar-left">
          <button className="browsebooks-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <div className="browse-books-header">
          <h1>Browse Books</h1>
          <h4>
            Browse all books available in the library and search by book name.
          </h4>
        </div>
      </header>

      <div className="view-books-search-section">
        <input
          type="text"
          placeholder="🔍 Search book by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="category-filter-section">
        <button
          className={
            activeCategoryId === "All" ? "category-btn active" : "category-btn"
          }
          onClick={handleAllClick}
        >
          All
        </button>

        <div className="category-dropdown-wrapper">
          <button
            className="category-btn dropdown-toggle"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {activeCategoryId === "All"
              ? "Categories ▾"
              : `${activeCategoryName} ▾`}
          </button>

          {dropdownOpen && (
            <div className="category-dropdown-menu">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-dropdown-item"
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {cat.categoryName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="no-books">
          <h3>No books found.</h3>
        </div>
      ) : (
        <>
          <div className="view-books-books-grid">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrowed={handleBookBorrowed}
              />
            ))}
          </div>

          {activeCategoryId === "All" && hasMore && (
            <div ref={loadMoreRef} style={{ height: 1 }} />
          )}

          {activeCategoryId === "All" && isLoadingMore && (
            <div className="no-books">
              <h3>Loading more books...</h3>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browsebooks;
