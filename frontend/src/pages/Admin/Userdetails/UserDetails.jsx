import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./UserDetails.css";

const UserDetails = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [user, setUser] = useState(null);

  const [delPopup, setDelPopup] = useState(false);

  const getUserDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/admin/userDetails/${userId}`,
        {
          withCredentials: true,
        },
      );

      setUser(response.data.userData);
    } catch (error) {
      console.log(error);
    }
  };

  const DeleteUser = async (user) => {
    console.log("Delete button clicked");
    console.log(user);
    if (user.borrowBooks.length < 1) {
      try {
        const response = await axios.delete(
          `http://localhost:8000/admin/deleteUser/${userId}`,
          {
            withCredentials: true,
          },
        );

        alert(response);
        setDelPopup(false);
        navigate("/viewUsers");
      } catch (error) {
        console.log(error);
        console.log(error.response?.data);
        alert(error);
      }
    } else {
      alert("Books must be returned first");
    }
  };

  useEffect(() => {
    getUserDetails();
  }, [userId]);

  if (!user) {
    return (
      <div className="loading-container">
        <h2>Loading User...</h2>
      </div>
    );
  }

  return (
    <div className="user-details-page">
      {/* Back Button */}

      <div className="back-section">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* User Profile Card */}

      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-picture">
            {user.userProfilePic ? (
              <img src={user.userProfilePic} alt={user.userName} />
            ) : (
              <div className="default-profile-avatar">
                {user.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1>{user.userName}</h1>
        </div>

        <div className="user-profile-details">
          <div className="detail-item">
            <span>Email</span>
            <p>{user.userEmail}</p>
          </div>

          <div className="detail-item">
            <span>Phone</span>
            <p>{user.userPhone}</p>
          </div>

          <div className="detail-item">
            <span>Gender</span>
            <p>{user.userGender}</p>
          </div>

          <div className="detail-item">
            <span>Borrowed</span>
            <p>
              {user.borrowBooks?.length || 0} Book
              {(user.borrowBooks?.length || 0) !== 1 && "s"}
            </p>
          </div>
        </div>
        <div className="user-delete-option">
          <button onClick={() => setDelPopup(true)}>🗑️</button>
        </div>
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
            <h3>{`Are you sure you want to delete ${user.userName} from library?`}</h3>

            {/* <form onSubmit={handleDeleteCategory}> */}
            {/* <div className="form-group"> */}

            <div className="modal-buttons">
              <button
                type="button"
                className="delete-btn"
                onClick={() => DeleteUser(user)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Borrowed Books */}

      <div className="borrowed-books-card">
        <h2>📚 Borrowed Books</h2>

        {user.borrowBooks && user.borrowBooks.length > 0 ? (
          <div className="borrowed-books-list">
            {user.borrowBooks.map((book, index) => (
              <div className="borrowed-book-item" key={index}>
                📖 {book.bookName}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-books">This user hasn't borrowed any books.</div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
