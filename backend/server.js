require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // logging
app.use(helmet()); // security headers

/* ================= DATABASE ================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1); // stop app if DB fails
  }
};

connectDB();

/* ================= SCHEMA ================= */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

/* ================= ROUTES ================= */

// Health check (important for DevOps)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Get all tasks
app.get("/tasks", async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create task
app.post("/tasks", async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = new Task({ title });
    await task.save();

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
});

// Update task
app.put("/tasks/:id", async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({
      message: "Task updated",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
});

// Delete task
app.delete("/tasks/:id", async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});