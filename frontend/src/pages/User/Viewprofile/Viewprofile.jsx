import axios from "axios";
import "./Viewprofile.css";
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../context/AuthContext";

const Viewprofile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      return;
    }

    async function getCurrentUser() {
      try {
        const response = await axios.get("http://localhost:8000/user/profile", {
          withCredentials: true,
        });

        if (response.data.success) {
          setUser(response.data.userdetails);
        }
      } catch (error) {
        console.log(error.response?.data);
        console.log(error.message);
      }
    }

    getCurrentUser();
  }, [user, setUser]);

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <button className="profile-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="profile-card">
        <div className="user-profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <h2>{user?.name}</h2>
        <p className="profile-subtitle">Library Member</p>

        <div className="profile-info">
          <div className="profile-info-row">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user?.email}</span>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-label">Phone</span>
            <span className="profile-info-value">{user?.phone}</span>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-label">Gender</span>
            <span className="profile-info-value">{user?.gender}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="profile-action-btn"
            onClick={() => navigate("/setnewpassword")}
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Viewprofile;
