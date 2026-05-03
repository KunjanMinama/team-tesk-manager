import { useEffect, useState, useContext } from "react";
import { API } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Tasks() {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await API.get("/tasks/my-tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data.tasks);
  };

  const updateStatus = async (id, status) => {
    await API.put(`/tasks/${id}/update-status`, null, {
      params: { status },
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Tasks</h1>
      {tasks.map((t) => (
        <div
          key={t.id}
          style={{ border: "1px solid #aaa", padding: 10, marginTop: 10 }}
        >
          <h4>{t.title}</h4>
          <p>{t.description}</p>
          <p>Status: {t.status}</p>

          <select
            value={t.status}
         onChange={(e) => updateStatus(t.id, e.target.value)}
            style={{
        padding: "5px",
         borderRadius: "5px",
         background:
        t.status === "done"
        ? "lightgreen"
        : t.status === "in_progress"
        ? "orange"
        : "#ddd",
  }}
>
          </select>
        </div>
      ))}
    </div>
  );
}