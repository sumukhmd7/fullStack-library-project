import { useState } from "react";
import "./Forgot_password.css";
import axios from "axios";

const Forgot_password = () => {
  const [email, setEmail] = useState("");
  const [phnum, setPhnum] = useState("");

  const SubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/user/forgetPassword",
        {
          userEmail: email,
          userPhone: phnum,
        },
        {
          withCredentials: true,
        },
      );

      alert(response.data.message);

      setEmail("");
      setPhnum("");
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h1 className="Heading"> Recover Password </h1>

      <form onSubmit={SubmitHandler} className="Form-submit">
        <input
          className="Forgot_email"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <input
          className="Forgot_phnum"
          type="tel"
          placeholder="Enter Phone number "
          value={phnum}
          onChange={(e) => {
            setPhnum(e.target.value);
          }}
        />

        <button className="Forgot-btn" type="submit">
          Recover
        </button>
      </form>
    </div>
  );
};

export default Forgot_password;
