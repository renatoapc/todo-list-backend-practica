const express = require("express");
const taskRoutes = require("./routes/tasks");
const authRoutes = require ("./routes/auth");
const cors = require("cors");
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

app.use(cors({
    origin: frontendUrl
}));

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);

module.exports = app;