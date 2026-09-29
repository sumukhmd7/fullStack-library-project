import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";

const PAGE_SIZE = 20; // users per page (backend allows up to 50)

const ManageUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState(""); // what the admin is typing
  const [debouncedSearch, setDebouncedSearch] = useState(""); // what we send to the backend

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Wait until the admin stops typing (400ms) before searching,
  // and always go back to page 1 for a new search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch one page of users whenever the page or the search changes.
  useEffect(() => {
    let ignore = false; // ignores the response if a newer request has started

    const getUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:8000/admin/viewUsers",
          {
            params: { page, limit: PAGE_SIZE, search: debouncedSearch },
            withCredentials: true,
          },
        );

        if (ignore) return;

        setUsers(response.data.usersData || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalUsers(response.data.total || 0);
      } catch (error) {
        console.log(error);
        if (error.response?.status === 401) {
          navigate("/", { replace: true });
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    getUsers();

    return () => {
      ignore = true;
    };
  }, [page, debouncedSearch, navigate]);

  const goToPage = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="admin-page"
      style={{ display: "flex", width: "100vw", minHeight: "100vh" }}
    >
      <main
        className="admin-main-no-sidebar"
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Navbar */}

        <header className="admin-navbar">
          <div className="navbar-left">
            <button
              className="managebooks-back-btn"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </header>

        {/* Page Content */}

        <section
          className="view-users-content"
          style={{ flexGrow: 1, width: "100%", boxSizing: "border-box" }}
        >
          {/* Header */}

          <div className="view-users-header">
            <div>
              <h1>Manage Users</h1>

              <p>View and manage all registered library members.</p>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Statistics */}

          <div className="users-summary-card">
            <div className="summary-icon">👥</div>

            <div>
              <h2>{totalUsers}</h2>
              <p>Registered Users</p>
            </div>
          </div>

          {/* Users Grid */}

          <div className="users-grid">
            {isLoading ? (
              <div className="no-users">
                <h2>Loading users...</h2>
              </div>
            ) : users.length === 0 ? (
              <div className="no-users">
                <h2>No Users Found</h2>
              </div>
            ) : (
              users.map((user) => (
                <div className="user-card" key={user.id}>
                  <div className="user-card-top">
                    <div className="user-avatar">
                      {user.userProfilePic ? (
                        <img src={user.userProfilePic} alt={user.userName} />
                      ) : (
                        <div className="default-avatar">
                          {user.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="user-basic-info">
                      <h3>{user.userName}</h3>
                      <p>{user.userEmail}</p>
                    </div>
                  </div>

                  <div className="user-details">
                    <div className="detail-row">
                      <span>📞 Phone</span>
                      <span>{user.userPhone}</span>
                    </div>
                  </div>

                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/userDetails/${user.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}

          {totalPages > 1 && (
            <div className="users-pagination">
              <button
                className="page-btn"
                disabled={page === 1 || isLoading}
                onClick={() => goToPage(page - 1)}
              >
                ← Previous
              </button>

              <span className="page-info">
                Page {page} of {totalPages}
              </span>

              <button
                className="page-btn"
                disabled={page === totalPages || isLoading}
                onClick={() => goToPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ManageUsers;
