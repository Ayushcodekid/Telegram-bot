require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/user");
const Settings = require("./models/settings");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: "*", // Replace with your frontend URL
    methods: "GET,POST,PUT,DELETE", // Allow specific HTTP methods
    credentials: true               // Allow cookies if necessary
}));


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Get all users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Block or delete a user
app.post("/users/:id", async (req, res) => {
  const { action } = req.body;
  const userId = req.params.id;

  if (action === "block") {
    await User.findByIdAndUpdate(userId, { subscribed: false });
    res.send("User blocked successfully.");
  } else if (action === "delete") {
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully.");
  } else {
    res.status(400).send("Invalid action.");
  }
});

// Update bot settings
app.post("/settings", async (req, res) => {
  const { apiKey } = req.body;

  const settings = await Settings.findOne();
  if (settings) {
    settings.apiKey = apiKey;
    await settings.save();
  } else {
    await new Settings({ apiKey }).save();
  }

  res.send("Settings updated successfully.");
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Admin panel running on http://localhost:${PORT}`));
