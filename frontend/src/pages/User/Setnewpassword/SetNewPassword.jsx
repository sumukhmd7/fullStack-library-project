import { useState } from "react";
import AuthContext from "../../../context/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./SetNewPassword.css";
import axios from "axios";

const SetNewPassword = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [newpassword, setNewpassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const SubmitHandler = async (e) => {
    e.preventDefault();

    if (newpassword !== confirm) {
      alert("Password mismatch");
      return;
    }

    try {
      const userID = user.userId;
      const response = await axios.post(
        `http://localhost:8000/user/setNewPassword/${userID}`,
        {
          oldPassword: current,
          newPassword: newpassword,
          confirmPassword: confirm,
        },
        {
          withCredentials: true,
        },
      );

      alert(response.data.message);

      setCurrent("");
      setNewpassword("");
      setConfirm("");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="password-container">
      <button className="password-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <form className="password-form" onSubmit={SubmitHandler}>
        <div className="password-icon">🔒</div>
        <h1>Set New Password</h1>
        <p>Keep your account secure with a strong password.</p>

        <input
          className="password-input"
          type="password"
          placeholder="Current password"
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value);
          }}
        />

        <input
          className="password-input"
          type="password"
          placeholder="Enter new password"
          value={newpassword}
          onChange={(e) => {
            setNewpassword(e.target.value);
          }}
        />

        <input
          className="password-input"
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
          }}
        />

        <button className="update-btn" type="submit">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default SetNewPassword;
