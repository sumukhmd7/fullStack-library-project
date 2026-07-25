import axios from "axios";
import { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../../context/AuthContext";
import "./Adminlogin.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("user");

  const { setUser } = useContext(AuthContext);

  const SubmitHandler = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (loginMode === "user") {
        response = await axios.post(
          "http://localhost:8000/user/userLogin",
          {
            userEmail: email,
            userPassword: password,
          },
          {
            withCredentials: true,
          },
        );
      } else {
        response = await axios.post(
          "http://localhost:8000/admin/adminLogin",
          {
            userEmail: email,
            userPassword: password,
          },
          {
            withCredentials: true,
          },
        );
      }
      console.log(response.data);

      if (response.data.success) {
        if (loginMode === "user") {
          setUser(response.data.userdetails);

          navigate("/home");
        } else {
          navigate("/admin");
        }
      }
    } catch (error) {
      console.log(error.response?.data);
      console.log(error);

      // alert("Invalid email or password. Please try again.");
      alert(error.response?.data?.message);
    }
  };

  return (
    <div
      className={`container ${
        loginMode === "admin" ? "admin-container" : "user-container"
      }`}
    >
      <h1 className="heading"> Welcome to Library </h1>

      <div className="login-tabs">
        <button
          type="button"
          className={loginMode === "user" ? "active-tab" : ""}
          onClick={() => setLoginMode("user")}
        >
          User
        </button>

        <button
          type="button"
          className={loginMode === "admin" ? "active-tab" : ""}
          onClick={() => setLoginMode("admin")}
        >
          Admin
        </button>
      </div>

      <h2>{loginMode === "user" ? "User Login" : "Admin Login"}</h2>

      <form onSubmit={SubmitHandler}>
        <input
          className="login-input"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />

        <button className="login-button" type="submit">
          Login
        </button>
      </form>

      {loginMode === "user" && (
        <>
          <Link to="/signup" className="signup-link">
            Sign Up
          </Link>

          <br />

          <Link to="/forgotPassword" className="forgot-password-link">
            Forgot Password ?
          </Link>
        </>
      )}
    </div>
  );
};

export default Login;
