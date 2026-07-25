import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { userId, token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const SubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:8000/user/resetPassword/${userId}/${token}`,
        {
          newPassword,
          confirmPassword,
        },
        {
          withCredentials: true,
        },
      );

      alert(response.data.message);
    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message);
    }
  };

  return (
    <div className="reset-container">
      <form className="Reset-pass-form" onSubmit={SubmitHandler}>
        <input
          className="new-password"
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          className="confirm-password"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="reset-btn" type="submit">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
