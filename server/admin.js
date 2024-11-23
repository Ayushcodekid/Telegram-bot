require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/user");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*", // Replace with your frontend URL
    methods: "GET,POST,PUT,DELETE", // Allow specific HTTP methods
    credentials: true, // Allow cookies if necessary
  })
);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ------------------------ User Management ------------------------

// Get all users with optional pagination
app.get("/users", async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default page 1, 10 users per page
  try {
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const totalUsers = await User.countDocuments();
    res.json({ users, totalPages: Math.ceil(totalUsers / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).send("Error fetching users: " + error.message);
  }
});

// Search users by chatId or name
app.get("/users/search", async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find({
      $or: [
        { chatId: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    });
    res.json(users);
  } catch (error) {
    res.status(500).send("Error searching users: " + error.message);
  }
});

// Block or delete a user
app.post("/users/:id", async (req, res) => {
  const { action } = req.body;
  const userId = req.params.id;

  try {
    if (action === "block") {
      await User.findByIdAndUpdate(userId, { subscribed: false });
      res.send("User blocked successfully.");
    } else if (action === "delete") {
      await User.findByIdAndDelete(userId);
      res.send("User deleted successfully.");
    } else {
      res.status(400).send("Invalid action.");
    }
  } catch (error) {
    res.status(500).send("Error managing user: " + error.message);
  }
});

// Activate (unblock) a user
app.post("/users/:id/activate", async (req, res) => {
  const userId = req.params.id;
  try {
    await User.findByIdAndUpdate(userId, { subscribed: true });
    res.send("User activated successfully.");
  } catch (error) {
    res.status(500).send("Error activating user: " + error.message);
  }
});

// Update user details
// app.put("/users/:id", async (req, res) => {
//   const userId = req.params.id;
//   const updates = req.body;

//   try {
//     const user = await User.findByIdAndUpdate(userId, updates, { new: true });
//     if (!user) {
//       return res.status(404).send("User not found.");
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).send("Error updating user: " + error.message);
//   }
// });




// ------------------------ Start the Server ------------------------

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Admin panel running on http://localhost:${PORT}`));
