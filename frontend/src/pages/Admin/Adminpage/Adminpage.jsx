import axios from "axios";
import { useEffect, useState } from "react";
import "./Adminpage.css";
import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";

const Adminpage = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    allUsers: 0,
    allBooks: 0,
    allCategories: 0,
  });

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/admin/Dashboard",
          {
            withCredentials: true,
          },
        );

        setDashboardData(response.data);
      } catch (error) {
        console.log(error.message);
      }
    };

    getDashboardData();
  }, []);

  const handlelogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/admin/logout",
        {},
        {
          withCredentials: true,
        },
      );

      navigate("/", { replace: true });
      // alert(response.data.message);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  return (
    <div className="admin-page">
      {/* SIDEBAR */}

      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">📖</div>

          <h2>Library Admin</h2>
        </div>

        <div className="admin-profile">
          <div className="admin-profile-avatar">A</div>

          <div className="profile-details">
            <h3>Admin</h3>

            {/* <p>
              <span className="online-dot"></span>
              Super Admin
            </p> */}
          </div>
        </div>

        <p className="menu-title">MAIN MENU</p>

        <nav className="admin-menu">
          <div className="menu-item active">
            <span className="menu-icon">▦</span>

            <span>Dashboard</span>
          </div>

          <div className="menu-item" onClick={() => navigate("/viewBooks")}>
            <span className="menu-icon">👥</span>

            <span>View Books</span>
          </div>

          {/* <div className="menu-item" onClick={() => navigate("/manageBooks")}>
            <span className="menu-icon">📖</span>
            <span>Manage Books</span>
          </div> */}

          <div
            className="menu-item"
            onClick={() => navigate("/availableBooks")}
          >
            <span className="menu-icon">📚</span>

            <span> 🟢 Available Books</span>
          </div>

          <div className="menu-item" onClick={() => navigate("/borrowedbooks")}>
            <span className="menu-icon">📚</span>

            <span> 🔴 Borrowed Books</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="menu-item logout" onClick={handlelogout}>
            <span className="menu-icon">↪</span>

            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="admin-main">
        {/* NAVBAR */}

        <header className="admin-navbar">
          <div className="navbar-left">
            <span className="hamburger">☰</span>
          </div>

          <div className="navbar-admin">
            <div className="navbar-avatar">A</div>

            <span className="navbar-admin-name">Admin</span>

            <span className="dropdown-icon">⌄</span>
          </div>
        </header>

        {/* DASHBOARD */}

        <section className="dashboard-content">
          <div className="dashboard-header">
            <h1>Dashboard</h1>

            <p>Welcome back, Admin! Here's what's happening in your library.</p>
          </div>

          {/* DASHBOARD CARDS */}

          <div className="dashboard-cards">
            {/* USERS CARD */}

            <div className="dashboard-card users-card">
              <div className="card-icon users-icon">👥</div>

              <div className="card-info">
                <p>Total Users</p>

                <h2>{dashboardData.allUsers}</h2>

                <span>Registered library members</span>
              </div>
            </div>

            {/* BOOKS CARD */}

            <div className="dashboard-card books-card">
              <div className="card-icon books-icon">📖</div>

              <div className="card-info">
                <p>Total Books</p>

                <h2>{dashboardData.allBooks}</h2>

                <span>Books in the library</span>
              </div>
            </div>

            {/* CATEGORIES CARD */}

            {/* <Link
              to="/book-categories"
              className="card-link-wrapper"
              style={{ textDecoration: "none", color: "inherit" }}
            >  */}
            <div className="dashboard-card categories-card">
              <div className="card-icon categories-icon">🗂️</div>

              <div className="card-info">
                <p>Total Categories</p>
                <h2>{dashboardData.allCategories}</h2>
                <span>Book categories</span>
              </div>
            </div>
            {/* </Link> */}
          </div>

          {/* MANAGEMENT SECTION */}

          <div className="management-section">
            <div className="management-header">
              <div>
                <h2>Library Management</h2>

                <p>
                  Manage your library users and borrowed books from the admin
                  dashboard.
                </p>
              </div>
            </div>

            <div className="management-cards">
              <div className="management-card">
                <div className="management-icon users-management-icon">🗂️</div>

                <div>
                  <h3>Manage Categories</h3>

                  <p>
                    Manage book categories and organize your library collection
                    efficiently.
                  </p>

                  <button
                    className="management-button"
                    onClick={() => navigate("/book-categories")}
                  >
                    Manage Categories
                  </button>
                </div>
              </div>

              <div className="management-card">
                <div className="management-icon books-management-icon">📚</div>

                <div>
                  <h3>Manage Books</h3>

                  <p>
                    View all books that are currently borrowed and unavailable.
                  </p>

                  <button
                    className="management-button"
                    onClick={() => navigate("/manageBooks")}
                  >
                    Manage Books
                  </button>
                </div>
              </div>

              <div className="management-card">
                <div className="management-icon users-management-icon">👥</div>

                <div>
                  <h3>Manage Users</h3>

                  <p>
                    View registered library users and check individual user
                    details.
                  </p>

                  <button
                    className="management-button"
                    onClick={() => navigate("/ManageUsers")}
                  >
                    Manage Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Adminpage;
