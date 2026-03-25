import { useEffect, useState } from "react";
import "./App.css";
import { toast, Toaster } from "react-hot-toast";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
      toast.error("Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!title) return toast.error("Task cannot be empty");

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, completed: false }),
      });

      setTitle("");
      toast.success("Task added!");
      fetchTasks();
    } catch {
      toast.error("Failed to add task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
        method: "DELETE",
      });
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Delete failed");
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditText(task.title);
  };

  const saveEdit = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editText }),
      });

      setEditingId(null);
      toast.success("Task updated");
      fetchTasks();
    } catch {
      toast.error("Update failed");
    }
  };

  const toggleComplete = async (task) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      fetchTasks();
    } catch {
      toast.error("Update failed");
    }
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    });

  return (
    <div className="app">
      <Toaster />
      <div className="card">
        <h2>🚀 DevOps Task Manager</h2>

        {/* Stats */}
        <div className="stats">
          <p>Total: {tasks.length}</p>
          <p>Completed: {tasks.filter(t => t.completed).length}</p>
          <p>Pending: {tasks.filter(t => !t.completed).length}</p>
        </div>

        {/* Add Task */}
        <div className="input-group">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a task..."
          />
          <button onClick={addTask}>Add</button>
        </div>

        {/* Search */}
        <input
          className="search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="filters">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("completed")}>Completed</button>
          <button onClick={() => setFilter("pending")}>Pending</button>
        </div>

        {/* Status */}
        {loading && <p className="info">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {/* Task List */}
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li key={task._id} className="task-item">

              {editingId === task._id ? (
                <>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button onClick={() => saveEdit(task._id)}>Save</button>
                </>
              ) : (
                <>
                  <span
                    onClick={() => toggleComplete(task)}
                    className={task.completed ? "completed" : ""}
                  >
                    {task.title}
                  </span>

                  <div className="actions">
                    <button className="edit" onClick={() => startEdit(task)}>
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}

            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;