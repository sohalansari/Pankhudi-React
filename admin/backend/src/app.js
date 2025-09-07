const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);


module.exports = app;


