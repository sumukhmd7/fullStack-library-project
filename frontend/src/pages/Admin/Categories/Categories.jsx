import { useState, useCallback } from "react";
import "./Categories.css";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const [search, setSearch] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [addPopup, setAddPopup] = useState(false);
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [delPopup, setDelPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [editPopup, setEditPopup] = useState(false);

  const handleDeleteCategory = async (categoryid) => {
    // const ConfirmDelete = window.confirm(
    //   `Are you sure you want to delete ${categoryName} ?`,
    // );

    // if (!ConfirmDelete) {
    //   return;
    // }

    try {
      const response = await axios.delete(
        `http://localhost:8000/admin/deleteCategory/${categoryid}`,
        {
          withCredentials: true,
        },
      );
      alert(response.data.message);
      await getAllCategories();
      setDelPopup(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }

      alert(error.response?.data?.message);
      console.log(error);
    }
  };

  const handleEditCategory = async (e, categoryid) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `http://localhost:8000/admin/editCategory/${categoryid}`,
        {
          categoryName: selectedCategory.categoryName,
        },
        { withCredentials: true },
      );
      await getAllCategories();
      setEditPopup(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }

      console.log(error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:8000/admin/addCategory",
        {
          categoryName: categoryName,
        },
        {
          withCredentials: true,
        },
      );

      await getAllCategories();
      setCategoryName("");

      setAddPopup(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }
      // alert(error.response?.data?.message);
      console.log(error);
    }
  };

  // -------PASS CATEGORY_DATA TO STATE--------

  const handleDeletePopup = async (category) => {
    setSelectedCategory(category);
    setDelPopup(true);
  };

  const handleEditPopup = async (category) => {
    setSelectedCategory(category);
    setEditPopup(true);
  };

  const getAllCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/admin/allCategories",
        {
          withCredentials: true,
        },
      );

      setCategoryData(response.data.categories);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }

      alert(error.response?.data?.message);
    }
  }, [navigate]);

  // ------GET CATEGORIES AS IT LOADS -------
  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  const filteredCategories = categoryData.filter((category) =>
    category.categoryName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <header className="admin-navbar">
        <div className="navbar-left">
          <button className="managebooks-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </header>
      <div className="categories-page">
        {/* Header */}
        <div className="categories-header">
          <div>
            <h1>📂 Categories</h1>
            <p>Manage all book categories in your library.</p>
          </div>

          <button
            className="add-category-btn"
            onClick={() => {
              setAddPopup(true);
            }}
          >
            + Add Category
          </button>
        </div>

        {addPopup && (
          <div className="addCategory-overlay">
            <div
              className="addCategory-popup"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="addCategoryclose-close"
                onClick={() => setAddPopup(false)}
              >
                ×
              </button>

              <h3>Add Category</h3>

              <form onSubmit={handleAddCategory}>
                <div className="form-group">
                  <label>Category Name</label>

                  <input
                    type="text"
                    name="categoryName"
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                    }}
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setAddPopup(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="save-btn">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
              <h3>
                {`Are you sure you want to delete ${selectedCategory?.categoryName}?`}
              </h3>

              {/* <form onSubmit={handleDeleteCategory}> */}
              {/* <div className="form-group"> */}

              <div className="modal-buttons">
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteCategory(selectedCategory.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {editPopup && (
          <div className="addCategory-overlay">
            <div
              className="addCategory-popup"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="addCategoryclose-close"
                onClick={() => setEditPopup(false)}
              >
                ×
              </button>

              <h3>Edit Category</h3>

              <form
                onSubmit={(e) => handleEditCategory(e, selectedCategory.id)}
              >
                <div className="form-group">
                  <label> Edit Category Name </label>

                  <input
                    type="text"
                    name="categoryName"
                    value={selectedCategory.categoryName}
                    onChange={(e) => {
                      setSelectedCategory({
                        ...selectedCategory,
                        categoryName: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditPopup(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="save-btn">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="categories-toolbar">
          {/* Search */}
          <div className="category-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Count */}
          <div className="category-count">
            <div className="category-count-icon">📂</div>

            <div className="category-count-text">
              <span className="category-count-label">Total Categories</span>

              <span className="category-count-number">
                {filteredCategories.length}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Category Name</th>
                <th>Actions</th>
                <th>No of books</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="category-name">
                        <div className="category-icon">📂</div>

                        {category.categoryName}
                      </div>
                    </td>

                    <td>
                      <div className="category-actions">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            handleEditPopup(category);
                          }}
                        >
                          ✏ Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => {
                            handleDeletePopup(category);
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>

                    <td>{category.bookCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">
                    <div className="empty-state">
                      <div style={{ fontSize: "45px" }}>📂</div>

                      <h3>No Categories Found</h3>

                      <p>Start by adding your first category.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
