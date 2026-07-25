const express = require("express");
const pool = require("./db");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const adminRoutes = require("./admin/routes/adminRoutes"); // adjust path
const bookRoutes = require("./admin/routes/bookRoutes");
const categoryRoutes = require("./admin/routes/categoryRoutes");

const reviewRoutes = require("./user/routes/reviewRoutes");
const userRoutes = require("./user/routes/userRoutes");
const borrowRoutes = require("./user/routes/borrowRoutes");

app.use("/admin", adminRoutes);
app.use("/books", bookRoutes);
app.use("/admin", categoryRoutes);
app.use("/user", reviewRoutes);
app.use("/user", userRoutes);
app.use("/books", borrowRoutes);

app.get("/", (req, res) => {
  res.json("Server is up and running on 8000");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8000, () => {
  console.log("Server is up and running on 8000");
});
