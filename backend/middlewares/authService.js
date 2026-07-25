const db = require("../db");
const { users } = require("../drizzle/schemas/userSchema");
const { eq } = require("drizzle-orm");

const checkUserRole = async (req, res, next, expectedRole) => {
  try {
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.userEmail, req.body.userEmail));

    if (!userData.length) {
      return res.status(401).json({
        success: false,
        message: `${expectedRole} not found`,
      });
    }

    const user = userData[0];

    if (user.userRole === expectedRole) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: `${user.userRole} is not authorized`,
    });
  } catch (error) {
    console.error(`Error in ${expectedRole} middleware:`, error);
    return res.status(500).send("Internal server error");
  }
};

const isUser = (req, res, next) => {
  checkUserRole(req, res, next, "user");
};

const isAdmin = (req, res, next) => {
  console.log(" hi im manish");
  checkUserRole(req, res, next, "admin");
};

module.exports = {
  isUser,
  isAdmin,
};
