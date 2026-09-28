import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import BookCard from "../../components/userComponents/BookCard/BookCard.jsx";
import "./Browsebooks.css";
import { useNavigate, useSearchParams } from "react-router-dom";

const PAGE_SIZE = 12;

const Browsebooks = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();

  // The URL decides the active category:
  //   /books              -> "All"
  //   /books?category=3   -> category 3
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryId = searchParams.get("category") || "All";

  // Fetches ONE page of books (12). Works for "All" and for a category.
  const fetchBooksPage = useCallback(
    async (cursor = null, append = false, searchText = "") => {
      setIsLoadingMore(true);
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
        if (cursor) params.set("cursor", cursor);
        if (searchText.trim()) params.set("search", searchText.trim());

        // "All" -> getallBooks, a category -> getBooksByCategory
        // Both return { books, hasMore, nextCursor }
        const url =
          activeCategoryId === "All"
            ? "http://localhost:8000/books/getallBooks"
            : `http://localhost:8000/books/getBooksByCategory/${activeCategoryId}`;

        const response = await axios.get(`${url}?${params.toString()}`, {
          withCredentials: true,
        });

        const pageBooks = response.data.books || [];

        if (append) {
          setAllBooks((prev) => [...prev, ...pageBooks]);
          setDisplayedBooks((prev) => [...prev, ...pageBooks]);
        } else {
          setAllBooks(pageBooks);
          setDisplayedBooks(pageBooks);
        }

        setNextCursor(response.data.nextCursor || null);
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

  // 1. Categories: load once
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
  }, []);

  // 2. First page: reload when the category or the search text changes
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        setNextCursor(null);
        setHasMore(true);
        fetchBooksPage(null, false, search);
      },
      search.trim() ? 300 : 0,
    );

    return () => clearTimeout(timeoutId);
  }, [search, fetchBooksPage]);

  // 3. Infinite scroll: load the next 12 when the bottom is near
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          nextCursor
        ) {
          fetchBooksPage(nextCursor, true, search);
        }
      },
      { rootMargin: "220px" },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [fetchBooksPage, hasMore, isLoadingMore, nextCursor, search]);

  const handleAllClick = () => {
    setSearchParams({}); // removes ?category=
    setDropdownOpen(false);
  };

  const handleCategorySelect = (categoryId) => {
    setSearchParams({ category: String(categoryId) });
    setDropdownOpen(false);
  };

  const activeCategoryName =
    activeCategoryId === "All"
      ? "All"
      : categories.find((c) => String(c.id) === String(activeCategoryId))
          ?.categoryName || "All";

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

      {displayedBooks.length === 0 && !isLoadingMore ? (
        <div className="no-books">
          <h3>No books found.</h3>
        </div>
      ) : (
        <>
          <div className="view-books-books-grid">
            {displayedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrowed={handleBookBorrowed}
              />
            ))}
          </div>

          {hasMore && <div ref={loadMoreRef} style={{ height: 1 }} />}

          {isLoadingMore && (
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
