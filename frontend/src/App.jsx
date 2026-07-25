import { Routes, Route } from "react-router-dom";
import Login from "./pages/User/Login/Login.jsx";
import Signup from "./pages/User/Signup/Signup.jsx";
// import Adminlogin from "./pages/Login/Adminlogin.jsx";
import Adminpage from "./pages/Admin/Adminpage/Adminpage.jsx";
import Homepage from "./pages/User/Homepage/Homepage.jsx";
import { useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "./context/AuthContext";
import Forgot_password from "./pages/User/Forgot_password/Forgot_password.jsx";
import ResetPassword from "./pages/User/Forgot_password/Forgot_password.jsx";
import SetNewPassword from "./pages/User/Setnewpassword/SetNewPassword.jsx";
import Viewprofile from "./pages/User/Viewprofile/Viewprofile.jsx";
import Browsebooks from "./pages/Books/Browsebooks.jsx";
import ManageBooks from "./pages/Admin/Managebooks/Managebooks.jsx";
import Borrowedbooks from "./pages/Admin/Borrowedbooks/Borrowedbooks.jsx";
import Categories from "./pages/Admin/Categories/Categories.jsx";
// import ViewUsers from "./pages/Admin/ViewUsers/ViewUsers.jsx";
import ManageUsers from "./pages/Admin/ManageUsers/ManageUsers.jsx";
import UserDetails from "./pages/Admin/Userdetails/UserDetails.jsx";
import AvailableBooks from "./pages/Admin/AvailableBooks/AvailableBooks.jsx";
import ViewBooks from "./pages/Admin/ViewBooks/ViewBooks.jsx";
import MyBorrowed from "./pages/User/MyBorrowed/MyBorrowed.jsx";
import "./App.css";

// import ForgotPassword from "./components/ForgotPassword";

function App() {
  const { user, setUser } = useContext(AuthContext);

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

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={<Adminpage />} />
      <Route path="/home" element={<Homepage />} />
      <Route path="/forgotpassword" element={<Forgot_password />} />
      <Route path="/resetPassword/:userId/:token" element={<ResetPassword />} />
      <Route path="/setnewpassword" element={<SetNewPassword />} />
      <Route path="/viewProfile/:id" element={<Viewprofile />} />
      <Route path="/books" element={<Browsebooks />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      <Route path="/manageBooks" element={<ManageBooks />} />
      <Route path="/borrowedbooks" element={<Borrowedbooks />} />
      <Route path="/book-categories" element={<Categories />} />
      <Route path="/ManageUsers" element={<ManageUsers />} />
      <Route path="/userDetails/:userId" element={<UserDetails />} />
      <Route path="/availableBooks" element={<AvailableBooks />} />
      {/* <Route path="/viewUsers" element={<ViewUsers />} /> */}
      <Route path="/viewBooks" element={<ViewBooks />} />

      <Route path="/borrowedList" element={<MyBorrowed />} />
    </Routes>
  );
}

export default App;
