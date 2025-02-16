const express = require("express");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authroutes");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
