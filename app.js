const express = require("express");
const taskRoutes = require("./routes/tasks");
const authRoutes = require ("./routes/auth");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);

module.exports = app;