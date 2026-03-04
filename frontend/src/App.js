import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/tasks`);
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async () => {
    if (!title) return;

    await fetch(`${process.env.REACT_APP_API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, completed: false }),
    });

    setTitle("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditText(task.title);
  };

  const saveEdit = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editText }),
    });

    setEditingId(null);
    fetchTasks();
  };

  return (
    <div className="app">
      <div className="card">
        <h2>🚀 DevOps Task Manager</h2>

        <div className="input-group">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a task..."
          />
          <button onClick={addTask}>Add</button>
        </div>

        <ul className="task-list">
          {tasks.map((task) => (
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
                  <span>{task.title}</span>
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