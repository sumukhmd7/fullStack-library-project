import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../../context/AuthContext";
import axios from "axios";
import "./Homepage.css";
import Browsebooks from "../../Books/Browsebooks.jsx";
// Placeholder catalog data — swap these for real calls to your
// GET /book/getallBooks and GET /user/dashboard endpoints.
const TOP_PICKS = [
  {
    id: 1,
    bookName: "The Quiet Order",
    bookAuthor: "N. Farrow",
    bookLikes: 128,
  },
  {
    id: 2,
    bookName: "Signal & Noise",
    bookAuthor: "R. Achebe",
    bookLikes: 104,
  },
  { id: 3, bookName: "Empire of Ink", bookAuthor: "C. Voss", bookLikes: 97 },
  { id: 4, bookName: "Grid Systems", bookAuthor: "M. Lund", bookLikes: 88 },
];

const CATALOG = [
  {
    id: 5,
    bookName: "The Quiet Order",
    bookAuthor: "N. Farrow",
    bookCategory: "Fiction",
    bookCost: 12,
    bookStatus: "available",
  },
  {
    id: 6,
    bookName: "Signal & Noise",
    bookAuthor: "R. Achebe",
    bookCategory: "Sci-Fi",
    bookCost: 15,
    bookStatus: "not available",
  },
  {
    id: 7,
    bookName: "Empire of Ink",
    bookAuthor: "C. Voss",
    bookCategory: "History",
    bookCost: 18,
    bookStatus: "available",
  },
  {
    id: 8,
    bookName: "Grid Systems",
    bookAuthor: "M. Lund",
    bookCategory: "Design",
    bookCost: 22,
    bookStatus: "available",
  },
  {
    id: 9,
    bookName: "Field Notes",
    bookAuthor: "A. Okoro",
    bookCategory: "Biography",
    bookCost: 14,
    bookStatus: "not available",
  },
  {
    id: 10,
    bookName: "Low Tide",
    bookAuthor: "S. Marchetti",
    bookCategory: "Fiction",
    bookCost: 11,
    bookStatus: "available",
  },
];

const CATEGORIES = [
  "All",
  "Fiction",
  "Sci-Fi",
  "History",
  "Design",
  "Biography",
];

const Homepage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);

  const [categoryID, setCategoryID] = useState(null);

  const [topPicks, setTopPicks] = useState([]);

  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const BOOKS_PER_PAGE = 8;

  useEffect(() => {
    setCurrentPage(0);

    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/books/getallBooks",
          { withCredentials: true },
        );
        // setAllBooks(response.data.books);
        setCatalog(response.data.books); // initially show all
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/", { replace: true });
        } else {
          console.error("Failed to fetch books:", error);
        }
      }
    };

    const fetchTopPicks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/books/getTopPicks",
          { withCredentials: true },
        );

        setTopPicks(response.data.topPicks);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/", { replace: true });
        } else {
          console.error("Failed to fetch books:", error);
        }
      }
    };

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
      }
    };

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

    fetchBooks();
    fetchCategories();
    fetchTopPicks();
    fetchBorrowedBooks();
  }, [query, activeCategory]);

  const handlelogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/user/logout",
        {},
        { withCredentials: true },
      );

      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategorySelect = async (categoryId) => {
    // setCategoryID(categoryId);
    // setDropdownOpen(false);
    try {
      const response = await axios.get(
        `http://localhost:8000/books/getBooksByCategory/${categoryId}`,
        { withCredentials: true },
      );
      setCatalog(response.data.books);
    } catch (error) {
      console.error("Failed to fetch books by category:", error);
    }
  };

  const filteredCatalog = catalog.filter((b) => {
    const matchesCategory =
      activeCategory === "All" || b.categoryName === activeCategory;
    const matchesQuery = b.bookName.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  if (categories === null || catalog === null) {
    return <div className="homepage-loading">Loading...</div>;
  }

  const totalPages = Math.ceil(filteredCatalog.length / BOOKS_PER_PAGE);

  const paginatedCatalog = filteredCatalog.slice(
    currentPage * BOOKS_PER_PAGE,
    currentPage * BOOKS_PER_PAGE + BOOKS_PER_PAGE,
  );

  return (
    <div className="homepage">
      {/* Navbar */}
      <header className="homepage-navbar">
        <div className="homepage-navbar-brand">
          <span className="homepage-navbar-logo">📚</span>
          <span className="homepage-navbar-title">Library</span>
        </div>

        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="navbar-user">
          <div className="navbar-avatar">{user?.name?.charAt(0)}</div>
          <span className="navbar-username">{user?.name}</span>
          <button className="logout-button" onClick={handlelogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/" className="sidebar-link active">
              Dashboard
            </Link>
            <Link to="/books" className="sidebar-link">
              Browse books
            </Link>
            <Link to="/borrowedList" className="sidebar-link">
              My borrowed
            </Link>
            <Link to={`/viewProfile/${user?.id}`} className="sidebar-link">
              Profile
            </Link>
            <Link to="/setnewpassword" className="sidebar-link">
              Change password
            </Link>
          </nav>

          <div className="sidebar-categories">
            <p className="sidebar-heading">Categories</p>
            <button
              className="sidebar-category"
              onClick={() => {
                setActiveCategory("All");
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`sidebar-category ${activeCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat.categoryName);
                  // handleCategorySelect(cat.id);
                }}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content">
          {/* Welcome banner */}
          <section className="welcome-banner">
            <div>
              {!user?.mode ? (
                <h1>Welcome back, {user?.name}</h1>
              ) : (
                <h1>Hello {user?.name}, welcome to the library</h1>
              )}
              <p>You have 2 of 2 borrow slots available.</p>
            </div>

            <div className="welcome-stats">
              <div>
                <p className="welcome-stat-number">{borrowedBooks.length}</p>
                <p className="welcome-stat-label">Borrowed</p>
              </div>
              <div>
                <p className="welcome-stat-number">12</p>
                <p className="welcome-stat-label">Reviews</p>
              </div>
              <div>
                <p className="welcome-stat-number">{catalog.length}</p>
                <p className="welcome-stat-label">Catalog size</p>
              </div>
            </div>
          </section>

          {/* Top picks */}
          <section className="top-picks">
            <div className="section-header">
              <h2>Top picks this week</h2>
              <Link to="/books">View all</Link>
            </div>

            <div className="top-picks-grid">
              {topPicks.map((book) => (
                <div key={book.id} className="pick-card">
                  <div className="pick-cover">{book.bookName.charAt(0)}</div>
                  <p className="pick-name">{book.bookName}</p>
                  <p className="pick-author">{book.bookAuthor}</p>
                  <p className="pick-likes">♥ {book.bookLikes}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Catalog */}
          <section className="catalog">
            <div className="section-header">
              <h2>Browse the catalog</h2>
              <span className="catalog-count">
                {filteredCatalog.length} results
              </span>
            </div>

            <div className="catalog-grid">
              {paginatedCatalog.map((book) => (
                <div key={book.id} className="catalog-card">
                  <div className="pick-cover">{book.bookName.charAt(0)}</div>
                  <p className="pick-name">{book.bookName}</p>
                  <p className="pick-author">{book.bookAuthor}</p>
                  <p className="catalog-category">{book.bookCategory}</p>

                  <div className="catalog-footer">
                    <span
                      className={`status-badge ${
                        book.bookStatus === "available"
                          ? "status-available"
                          : "status-out"
                      }`}
                    >
                      {book.bookStatus === "available"
                        ? "Available"
                        : "Checked out"}
                    </span>
                    <span className="catalog-price">₹{book.bookCost}</span>
                  </div>

                  {/* <button
                    className="borrow-button"
                    disabled={book.bookStatus !== "available"}
                  >
                    {book.bookStatus === "available" ? "Borrow" : "Unavailable"}
                  </button> */}
                </div>
              ))}
            </div>

            {filteredCatalog.length === 0 && (
              <p className="catalog-empty">No books match that search.</p>
            )}

            {totalPages > 1 && (
              <div className="catalog-pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`catalog-dot ${currentPage === i ? "active" : ""}`}
                    onClick={() => setCurrentPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Homepage;
