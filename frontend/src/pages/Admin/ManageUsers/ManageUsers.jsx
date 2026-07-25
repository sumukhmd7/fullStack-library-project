import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";

const ManageUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const getAllUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/admin/viewUsers",
        {
          withCredentials: true,
        },
      );

      setUsers(response.data.usersData || []);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/admin/logout",
        {},
        {
          withCredentials: true,
        },
      );

      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(search.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="admin-page"
      style={{ display: "flex", width: "100vw", minHeight: "100vh" }}
    >
      {/* ================= Sidebar ================= */}

      {/* <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">📖</div>
          <h2>Library Admin</h2>
        </div>

        <div className="admin-profile">
          <div className="profile-avatar">A</div>

          <div className="profile-details">
            <h3>Admin</h3>
          </div>
        </div>

        <p className="menu-title">MAIN MENU</p>

        <nav className="admin-menu">
          <div className="menu-item" onClick={() => navigate("/admin")}>
            <span className="menu-icon">▦</span>
            <span>Dashboard</span>
          </div>

          <div className="menu-item active">
            <span className="menu-icon">👥</span>
            <span>View Users</span>
          </div>

          <div className="menu-item" onClick={() => navigate("/manageBooks")}>
            <span className="menu-icon">📖</span>
            <span>Manage Books</span>
          </div>

          <div className="menu-item" onClick={() => navigate("/borrowedbooks")}>
            <span className="menu-icon">📚</span>
            <span>Borrowed Books</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="menu-item logout" onClick={handleLogout}>
            <span className="menu-icon">↪</span>
            <span>Logout</span>
          </div>
        </div>
      </aside> */}

      {/* ================= Main ================= */}

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
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Statistics */}

          <div className="users-summary-card">
            <div className="summary-icon">👥</div>

            <div>
              <h2>{filteredUsers.length}</h2>
              <p>Registered Users</p>
            </div>
          </div>

          {/* Users Grid */}

          <div className="users-grid">
            {filteredUsers.length === 0 ? (
              <div className="no-users">
                <h2>No Users Found</h2>
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <div className="user-card" key={index}>
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
        </section>
      </main>
    </div>
  );
};

export default ManageUsers;
