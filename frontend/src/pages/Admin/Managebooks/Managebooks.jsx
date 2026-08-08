import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import "./Managebooks.css";
import { useNavigate } from "react-router-dom";

// Centralize the base URL so it's not hardcoded in 8 different places.
// Move this to an env var (e.g. import.meta.env.VITE_API_BASE_URL) when you deploy.
const API_BASE_URL = "http://localhost:8000";

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
// });

const EMPTY_BOOK_FORM = {
  bookId: "",
  bookName: "",
  bookDescription: "",
  bookAuthor: "",
  bookStatus: "",
  categoryId: "",
  bookCost: "",
};

const ManageBooks = () => {
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchBook, setSearchBook] = useState("");

  const [showAddBook, setShowAddBook] = useState(false);
  const [showEditBook, setShowEditBook] = useState(false);

  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedBookName, setSelectedBookName] = useState(null);
  const [bookImage, setBookImage] = useState(null);

  const [delPopup, setDelPopup] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);

  const [bookData, setBookData] = useState(EMPTY_BOOK_FORM);

  // Loading / submitting flags so the UI can disable actions instead of
  // silently racing ahead of data that hasn't arrived yet.
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // SHARED ERROR HANDLER
  // ==========================================

  const handleApiError = useCallback(
    (error, fallbackMessage) => {
      if (error?.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }
      alert(error?.response?.data?.message || fallbackMessage);
    },
    [navigate],
  );

  // ==========================================
  // API FETCH FUNCTIONS (MEMOIZED)
  // ==========================================

  const getAllCategories = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/allCategories`, {
      withCredentials: true,
    });
    setCategories(response.data.categories || []);
  }, []);

  const getAllBooks = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/books/getallBooks`, {
      withCredentials: true,
    });
    setBooks(response.data.books || []);
  }, []);

  // Reusable refresh — no longer duplicated, uses the same error handling
  // as everything else so a 401 during a refresh redirects like it should.
  const refreshBooks = useCallback(async () => {
    try {
      await getAllBooks();
    } catch (error) {
      handleApiError(error, "Failed to refresh books.");
    }
  }, [getAllBooks, handleApiError]);

  // ==========================================
  // LIFECYCLE EFFECTS
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const initializePageData = async () => {
      try {
        // Run in parallel — no reason to wait for books before loading
        // categories, and this removes the race condition that let users
        // open "Add Book" before categories had loaded.
        await Promise.all([getAllBooks(), getAllCategories()]);
      } catch (error) {
        handleApiError(error, "Failed to load page data.");
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };

    initializePageData();

    return () => {
      isMounted = false;
    };
  }, [getAllBooks, getAllCategories, handleApiError]);

  // ==========================================
  // COMPONENT UTILITIES & DATA MUTATIONS
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBookData((previousBookData) => ({
      ...previousBookData,
      [name]: value,
    }));
  };

  const clearBookForm = () => {
    setBookData(EMPTY_BOOK_FORM);
    setBookImage(null);
    setSelectedBookId(null);
  };

  // Basic shared validation before hitting the API.
  const validateBookForm = ({ requireImage }) => {
    if (!bookData.bookName.trim()) return "Book name is required.";
    if (!bookData.bookDescription.trim())
      return "Book description is required.";
    if (!bookData.bookAuthor.trim()) return "Author name is required.";
    if (!bookData.categoryId) return "Please select a category.";
    if (
      bookData.bookCost === "" ||
      Number(bookData.bookCost) < 0 ||
      Number.isNaN(Number(bookData.bookCost))
    ) {
      return "Please enter a valid, non-negative book cost.";
    }
    if (requireImage && !bookImage) return "Please select a book image.";
    return null;
  };

  // ==========================================
  // HANDLERS (ADD, EDIT, UPDATE, DELETE)
  // ==========================================

  const handleAddBook = async (event) => {
    event.preventDefault();

    const validationError = validateBookForm({ requireImage: true });
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bookName", bookData.bookName);
      formData.append("bookDescription", bookData.bookDescription);
      formData.append("bookAuthor", bookData.bookAuthor);
      formData.append("categoryId", bookData.categoryId);
      formData.append("bookCost", bookData.bookCost);
      formData.append("bookImage", bookImage);

      const response = await axios.post(
        `${API_BASE_URL}/books/addBook`,
        formData,
        { withCredentials: true },
      );

      alert(response.data.message);
      setShowAddBook(false);
      clearBookForm();
      await refreshBooks();
    } catch (error) {
      handleApiError(error, "Failed to add book.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBook = async (bookId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/books/bookDetails/${bookId}`,
        { withCredentials: true },
      );
      const book = response.data.bookData;

      setBookData({
        bookId: book.id,
        bookName: book.bookName ?? "",
        bookDescription: book.bookDescription ?? "",
        bookAuthor: book.bookAuthor ?? "",
        bookStatus: book.bookStatus ?? "",
        categoryId: book.categoryId ?? "",
        bookCost: book.bookCost ?? "",
      });

      setSelectedBookId(bookId);
      setShowEditBook(true);
    } catch (error) {
      handleApiError(error, "Failed to load book details.");
    }
  };

  const handleUpdateBook = async (event) => {
    event.preventDefault();

    const validationError = validateBookForm({ requireImage: false });
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      // Include bookCost — the original code silently dropped this on edit.
      // If a new image was chosen during edit, send multipart data;
      // otherwise send plain JSON (no need to touch the image at all).
      let response;
      if (bookImage) {
        const formData = new FormData();
        formData.append("bookStatus", bookData.bookStatus);
        formData.append("bookName", bookData.bookName);
        formData.append("bookDescription", bookData.bookDescription);
        formData.append("bookAuthor", bookData.bookAuthor);
        formData.append("categoryId", bookData.categoryId);
        formData.append("bookCost", bookData.bookCost);
        formData.append("bookImage", bookImage);

        response = await axios.patch(
          `${API_BASE_URL}/books/editBook/${selectedBookId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          },
        );
      } else {
        response = await axios.patch(
          `${API_BASE_URL}/books/editBook/${selectedBookId}`,
          {
            bookStatus: bookData.bookStatus,
            bookName: bookData.bookName,
            bookDescription: bookData.bookDescription,
            bookAuthor: bookData.bookAuthor,
            categoryId: bookData.categoryId,
            bookCost: bookData.bookCost,
          },
          { withCredentials: true },
        );
      }

      alert(response.data.message);
      setShowEditBook(false);
      clearBookForm();
      await refreshBooks();
    } catch (error) {
      handleApiError(error, "Failed to update book.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------HANDLING DELETE POPUP------
  const handleDeletePopup = async (bookId, bookName) => {
    setDelPopup(true);

    setSelectedBookName(bookName);
    setSelectedBookId(bookId);
  };

  const handleDeleteBook = async (bookId) => {
    // const confirmDelete = window.confirm(
    //   `Are you sure you want to delete "${bookName}"?`,
    // );
    // if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/books/deleteBook/${bookId}`,
        { withCredentials: true },
      );
      alert(response.data.message);
      setDelPopup(false);
      await refreshBooks();
    } catch (error) {
      handleApiError(error, "Failed to delete book.");
    }
  };

  // ==========================================
  // SEARCH / FILTER LOGIC
  // ==========================================

  // Defensive: handles books with a missing/null name instead of crashing.
  const filteredBooks = books.filter((book) =>
    (book.bookName ?? "").toLowerCase().includes(searchBook.toLowerCase()),
  );

  // Cache-busting so a re-uploaded image (same filename, new content)
  // actually shows the new image instead of a stale cached one.
  //
  // Full external URLs (e.g. from CSV-imported books using Open Library
  // covers) are used as-is — only locally-uploaded images (relative paths
  // like /uploads/booksImages/xyz.webp) need the backend host prefixed,
  // and only those benefit from a cache-busting query param.
  const getImageUrl = (imagePath, updatedAt) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;

    const version = updatedAt ? new Date(updatedAt).getTime() : imagePath;
    return `${API_BASE_URL}${imagePath}?v=${encodeURIComponent(version)}`;
  };

  // ==========================================
  // RENDER UI (JSX)
  // ==========================================

  if (isPageLoading) {
    return (
      <div className="manage-books-page">
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div>
      {/* {---TEMPORARY CODE----} */}
      <header className="admin-navbar">
        <div className="navbar-left">
          <button className="managebooks-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </header>

      <div className="manage-books-page">
        {/* --- PAGE HEADER --- */}

        <div className="manage-books-header">
          <div>
            <h1> 📚 Manage Books</h1>
            <p>Manage, add, edit and remove books from your library.</p>
          </div>

          <button
            className="add-book-button"
            disabled={categories.length === 0}
            title={
              categories.length === 0
                ? "No categories available yet"
                : "Add a new book"
            }
            onClick={() => {
              clearBookForm();
              setShowAddBook(true);
            }}
          >
            + Add New Book
          </button>
        </div>

        {/* --- BOOK TOOLBAR --- */}
        <div className="books-toolbar">
          <div className="book-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search books by name..."
              value={searchBook}
              onChange={(event) => setSearchBook(event.target.value)}
            />
          </div>

          <div className="books-count">
            Total Books: <strong>{books.length}</strong>
          </div>
        </div>

        {/* --- BOOKS TABLE --- */}
        <div className="books-table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Likes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <div className="book-info">
                        <img
                          src={getImageUrl(book.bookImage, book.updatedAt)}
                          alt={book.bookName || "Book cover"}
                          className="book-image"
                          onClick={() =>
                            setSelectedImage(
                              getImageUrl(book.bookImage, book.updatedAt),
                            )
                          }
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholder-book.png";
                          }}
                        />

                        <div>
                          <span className="book-name">{book.bookName}</span>
                          <p
                            className="book-description"
                            onClick={() =>
                              setSelectedDescription(book.bookDescription)
                            }
                          >
                            {(book.bookDescription || "").length > 50
                              ? book.bookDescription.substring(0, 50) + "..."
                              : book.bookDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="book-author">{book.bookAuthor}</td>

                    <td>
                      <span className="category-badge">
                        {book.categoryName}
                      </span>
                    </td>

                    <td className="book-cost">₹{book.bookCost}</td>

                    <td>
                      <span
                        className={
                          book.bookStatus === "available"
                            ? "status available"
                            : "status borrowed"
                        }
                      >
                        {book.bookStatus}
                      </span>
                    </td>

                    <td>{book.bookLikes || 0}</td>

                    <td>
                      <div className="book-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEditBook(book.id)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeletePopup(book.id, book.bookName)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-books">
                    No books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ----- DELETE POPUP MODAL ------ */}
        {delPopup && (
          <div className="addCategory-overlay">
            <div
              className="addCategory-popup"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="addCategoryclose-close"
                onClick={() => setDelPopup(false)}
              >
                ×
              </button>
              <h3>{`Are you sure you want to delete ${selectedBookName}?`}</h3>

              {/* <form onSubmit={handleDeleteCategory}> */}
              {/* <div className="form-group"> */}

              <div className="modal-buttons">
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteBook(selectedBookId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- IMAGE POPUP MODAL --- */}
        {selectedImage && (
          <div className="image-modal" onClick={() => setSelectedImage(null)}>
            <div
              className="image-modal-content"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="close-modal"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>

              <img src={selectedImage} alt="Book" className="popup-image" />
            </div>
          </div>
        )}

        {/* --- DESCRIPTION POPUP OVERLAY --- */}
        {selectedDescription && (
          <div
            className="description-overlay"
            onClick={() => setSelectedDescription(null)}
          >
            <div
              className="description-popup"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="description-close"
                onClick={() => setSelectedDescription(null)}
              >
                ×
              </button>

              <h3>Book Description</h3>
              <p>{selectedDescription}</p>
            </div>
          </div>
        )}

        {/* --- ADD BOOK MODAL FORM --- */}
        {showAddBook && (
          <div className="modal-overlay">
            <div className="book-modal">
              <div className="modal-header">
                <div>
                  <h2>Add New Book</h2>
                  <p>Add a new book to your library.</p>
                </div>

                <button
                  className="close-modal"
                  onClick={() => {
                    setShowAddBook(false);
                    clearBookForm();
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddBook}>
                <div className="form-group">
                  <label>Book Name</label>
                  <input
                    type="text"
                    name="bookName"
                    value={bookData.bookName}
                    onChange={handleChange}
                    placeholder="Enter book name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Book Description</label>
                  <textarea
                    name="bookDescription"
                    value={bookData.bookDescription}
                    onChange={handleChange}
                    placeholder="Enter book description"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Book Author</label>
                  <input
                    type="text"
                    name="bookAuthor"
                    value={bookData.bookAuthor}
                    onChange={handleChange}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Book Category</label>
                  <select
                    className="custom-select"
                    name="categoryId"
                    value={bookData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Book Cost</label>
                  <input
                    type="number"
                    name="bookCost"
                    min="0"
                    step="1"
                    value={bookData.bookCost}
                    onChange={handleChange}
                    placeholder="Enter book cost"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Book Image</label>
                  <input
                    key={showAddBook ? "add-open" : "add-closed"}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setBookImage(event.target.files[0] || null)
                    }
                    required
                  />
                </div>

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="cancel-button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowAddBook(false);
                      clearBookForm();
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-book-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- EDIT BOOK MODAL FORM --- */}
        {showEditBook && (
          <div className="modal-overlay">
            <div className="book-modal">
              <div className="modal-header">
                <div>
                  <h2>Edit Book</h2>
                  <p>Update the selected book details.</p>
                </div>

                <button
                  className="close-modal"
                  onClick={() => {
                    setShowEditBook(false);
                    clearBookForm();
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateBook}>
                <div className="form-group">
                  <label>Book Name</label>
                  <input
                    type="text"
                    name="bookName"
                    value={bookData.bookName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Book Description</label>
                  <textarea
                    name="bookDescription"
                    value={bookData.bookDescription}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Book Status</label>
                  <select
                    className="custom-select"
                    name="bookStatus"
                    value={bookData.bookStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Book Author</label>
                  <input
                    type="text"
                    name="bookAuthor"
                    value={bookData.bookAuthor}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Book Category</label>
                  <select
                    className="custom-select"
                    name="categoryId"
                    value={bookData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Book Cost</label>
                  <input
                    type="number"
                    name="bookCost"
                    min="0"
                    step="1"
                    value={bookData.bookCost}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Book Image (optional — leave blank to keep current)
                  </label>
                  <input
                    key={showEditBook ? "edit-open" : "edit-closed"}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setBookImage(event.target.files[0] || null)
                    }
                  />
                </div>

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="cancel-button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowEditBook(false);
                      clearBookForm();
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-book-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooks;
