const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../../db");

const { users } = require("../../drizzle/schemas/userSchema");
const { books } = require("../../drizzle/schemas/bookSchema");

const transporter = require("../../services/emailService");
const userLogger = require("../../utils/userLogger/userLogger");

const { and, eq, desc, or } = require("drizzle-orm");
const { success, email } = require("zod");

const signupUser = async (req, res) => {
  try {
    const { userEmail, userPhone, userPassword } = req.body;

    const userExistEmail = await db
      .select()
      .from(users)
      .where(eq(users.userEmail, userEmail));

    if (userExistEmail) {
      userLogger.log("info", "User Already Exists");
    }

    const userExistPhone = await db
      .select()
      .from(users)
      .where(eq(users.userPhone, userPhone));

    if (!userExistEmail.length && !userExistPhone.length) {
      const bcryptPassword = await bcrypt.hash(userPassword, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          ...req.body,
          userPassword: bcryptPassword,
          userProfilePic:
            "D:/My Space/Node Projects/library-management/uploads/avatar/blankAvatar",
          usedPasswords: [bcryptPassword],
        })
        .returning();

      userLogger.log("info", "User created successfully");

      const token = jwt.sign(
        { userId: newUser.userId },
        process.env.SECRET_KEY,
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      res.status(201).send({
        success: true,
        message: "User created successfully",
        userDetails: {
          userId: newUser.userId,
          name: newUser.userName,
          email: newUser.userEmail,
          phone: newUser.userPhone,
          address: newUser.userAddress,
          gender: newUser.userGender,
          mode: "signup",
        },
      });

      try {
        const info = await transporter.sendMail({
          to: req.body.userEmail,
          from: process.env.EMAIL_USER,
          subject: "Welcome Aboard!",
          html: `
            <h2>Hi ${req.body.userName}</h2>

            <p>Welcome to Library Management System! 🎉</p>

            <p>
              Your account has been created successfully and you're ready to get started.
            </p>

            <ul>
              <li>Browse available books</li>
              <li>Borrow and return books</li>
              <li>Write reviews and ratings</li>
              <li>Manage your profile</li>
            </ul>

            <p>
              We're excited to have you as part of our community.
            </p>

            <p>
              If you have any questions, feel free to contact our support team.
            </p>

            <p>
              Happy Reading!<br><br>
              Regards,<br>
              Library Management Team
            </p>
          `,
        });

        console.log("Email sent successfully:", info.messageId);
      } catch (error) {
        console.error("Error sending email:", error.message);
      }

      return;
    }

    userLogger.log("error", "User email or phone is already in use!");

    return res.status(400).send({
      success: false,
      message: "User email or phone is already in use!",
    });
  } catch (error) {
    userLogger.log("error", `Error occur: ${error.message}`);

    return res.status(500).send({
      success: false,
      message: "Error occur",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    console.log("request coming till here");

    const userData = await db
      .select()
      .from(users)
      .where(eq(users.userEmail, userEmail));

    if (!userData.length) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }

    const user = userData[0];

    const isPasswordCorrect = await bcrypt.compare(
      userPassword,
      user.userPassword,
    );

    if (isPasswordCorrect) {
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      userLogger.log("info", "User login success!");

      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // localhost
        maxAge: 60 * 60 * 1000,
      });

      return res.status(200).send({
        success: true,
        message: "User login success",
        userdetails: {
          name: user.userName,
          email: user.userEmail,
          gender: user.userGender,
          phone: user.userPhone,
          userId: user.id,
        },
      });
    }

    userLogger.log("error", "User password or email is incorrect!");

    res.status(401).send({
      success: false,
      message: "Invalid email or password. Please try again.",
    });
  } catch (error) {
    userLogger.log("error", error.message);

    res.status(500).send({
      success: false,
      message: "Error occur",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.userId));

    const founduser = result[0];

    if (!founduser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      userdetails: {
        name: founduser.userName,
        email: founduser.userEmail,
        phone: founduser.userPhone,
        gender: founduser.userGender,
        id: founduser.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { userEmail, userPhone } = req.body;

    const userData = await db
      .select()
      .from(users)
      .where(
        and(eq(users.userEmail, userEmail), eq(users.userPhone, userPhone)),
      );

    if (!userData.length) {
      return res.status(400).send({
        success: false,
        message: "User not found!",
      });
    }

    const user = userData[0];

    const token = jwt.sign({ userData: user }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const link = `http://localhost:5173/resetPassword/${user.id}/${token}`;

    await transporter.sendMail({
      to: user.userEmail,
      from: process.env.EMAIL_USER,
      subject: "Reset Password",
      html: `
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${link}">Link for reset Password</a>`,
    });

    userLogger.log("info", "User got the mail for reset their password");

    res.status(200).send({
      success: true,
      message: "We just sent you a mail !",
      // userId: user.id,
      // token,
    });
  } catch (error) {
    console.log("Forget password error:", error); // 👈 IMPORTANT
    userLogger.log("error", error.message);

    res.status(500).send({
      success: false,
      message: "Error occur",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    const userData = await db.select().from(users).where(eq(users.id, userId));

    if (!userData.length) {
      return res.status(401).send({
        success: false,
        message: "User not found!",
      });
    }

    jwt.verify(token, process.env.SECRET_KEY);

    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        success: false,
        message: "New password not match",
      });
    }

    const user = userData[0];

    let isPasswordExist = false;

    for (const oldPassword of user.usedPasswords) {
      if (await bcrypt.compare(newPassword, oldPassword)) {
        isPasswordExist = true;
        break;
      }
    }

    if (isPasswordExist) {
      return res.status(401).send({
        success: false,
        message: "Password used previously",
      });
    }

    const bcryptPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        userPassword: bcryptPassword,
        usedPasswords: [...user.usedPasswords, bcryptPassword],
      })
      .where(eq(users.id, userId));

    userLogger.log("info", "User password updated!");

    res.status(200).send({
      success: true,
      message: "Your password is updated!",
    });
  } catch (error) {
    userLogger.log("error", error.message);

    res.status(500).send({
      success: false,
      message: "Error occur",
    });
  }
};

const setNewPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const userData = await db.select().from(users).where(eq(users.id, userId));

    if (!userData.length) {
      return res.status(401).send({
        success: false,
        message: "User not found!",
      });
    }

    const user = userData[0];

    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.userPassword,
    );

    if (!isPasswordCorrect) {
      return res.status(400).send({
        success: false,
        message: "Old password incorrect",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        success: false,
        message: "Password mismatch",
      });
    }

    const bcryptPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        userPassword: bcryptPassword,
        usedPasswords: [...user.usedPasswords, bcryptPassword],
      })
      .where(eq(users.id, userId));

    res.status(200).send({
      success: true,
      message: "Your password is updated!",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const viewProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userData = await db
      .select({
        userName: users.userName,
        userPhone: users.userPhone,
        userEmail: users.userEmail,
        userAddress: users.userAddress,
        userProfilePic: users.userProfilePic,
        borrowBooks: users.borrowBooks,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userData.length) {
      return res.status(400).send({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).send({
      success: true,
      message: "Your profile!",
      userProfile: userData[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error occur",
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userProfilePic = req.file
      ? `/upload/userProfile/${req.file.filename}`
      : undefined;

    const updatedUser = await db
      .update(users)
      .set({
        userName: req.body.userName,
        userPhone: req.body.userPhone,
        userAddress: req.body.userAddress,
        userProfilePic,
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser.length) {
      return res.status(401).send({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).send({
      success: true,
      message: "User profile is edited!",
      userProfile: updatedUser[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error occur",
    });
  }
};

const userDashBoard = async (req, res) => {
  try {
    const topBooks = await db
      .select()
      .from(books)
      .orderBy(desc(books.bookLikes))
      .limit(5);

    res.status(200).send({
      success: true,
      message: "Top Books!",
      books: topBooks,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error occur",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    {
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
  }
};

module.exports = {
  signupUser,
  loginUser,
  forgetPassword,
  resetPassword,
  setNewPassword,
  viewProfile,
  editProfile,
  userDashBoard,
  getUserProfile,
  logoutUser,
};
