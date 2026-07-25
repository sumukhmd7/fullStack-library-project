import { useState } from "react";
import "./Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../../context/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [phonenum, setPhonenum] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const navigate = useNavigate();

  const { setUser } = useContext(AuthContext);

  const SubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/user/signupUser",
        {
          userName: name,
          userPhone: phonenum,
          userEmail: email,
          userPassword: password,
          userAddress: address,
          userGender: gender,
        },
        {
          withCredentials: true,
        },
      );

      console.log(response.data);

      if (response.data.success) {
        setUser(response.data.userDetails);

        navigate("/home");
      }
    } catch (error) {
      console.log(error.response?.data);
      console.log(error.message);
      alert(error.message);
    }
  };
  return (
    <div className="signup-container">
      <form onSubmit={SubmitHandler} className="signup-form">
        <h1 className="signup-heading">Signup </h1>

        <input
          className="signup-input"
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />

        <input
          className="signup-input"
          type="tel"
          placeholder="Phone number"
          value={phonenum}
          onChange={(e) => {
            setPhonenum(e.target.value);
          }}
        />

        <input
          className="signup-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <input
          className="signup-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />

        <div className="gender-title">Select Gender</div>

        <div className="signup-radio-group">
          <label className="signup-radio-option">
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={gender === "Male"}
              onChange={(e) => setGender(e.target.value)}
            />
            <div className="radio-card">Male</div>
          </label>

          <label className="signup-radio-option">
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={gender === "Female"}
              onChange={(e) => setGender(e.target.value)}
            />
            <div className="radio-card">Female</div>
          </label>

          <label className="signup-radio-option">
            <input
              type="radio"
              name="gender"
              value="Other"
              checked={gender === "Other"}
              onChange={(e) => setGender(e.target.value)}
            />
            <div className="radio-card">Other</div>
          </label>
        </div>

        <textarea
          className="signup-address"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
          }}
        ></textarea>

        <button className="signup-button" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
