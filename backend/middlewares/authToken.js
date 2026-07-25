const jwt = require("jsonwebtoken");

const userAuthentication = async function (req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = req.cookies.token || bearerToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token not found",
    });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "User token is incorrect",
      });
    } else {
      req.user = decoded;
      next();
    }
  });
};

module.exports = userAuthentication;
