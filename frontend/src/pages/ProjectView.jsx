import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];

function getPriorityClass(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "high") return "priority-high";
  if (p === "medium") return "priority-medium";
  return "priority-low";
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useContext(AuthContext);
  const currentUserId = user?.id;

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);

  const [task, setTask] = useState({
    title: "", description: "", due_date: "", priority: "Medium", assigned_to: "",
  });

  const isAdmin = project?.is_admin || project?.admin_id === currentUserId;

  // ─── FETCHERS ───────────────────────────────────────────────
  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error("Fetch project error:", err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await API.get(`/projects/members/${id}`);
      setMembers(res.data.members || []);
    } catch (err) {
      console.error("Fetch members error:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${id}`);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchProject(), fetchMembers(), fetchTasks()]);
    setLoading(false);
  };

  // ─── ACTIONS ────────────────────────────────────────────────
  const addMember = async () => {
    if (!email.trim()) return;
    try {
      await API.post(`/projects/${id}/add-member?email=${encodeURIComponent(email)}`);
      setEmail("");
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add member");
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await API.delete(`/projects/${id}/remove-member/${userId}`);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to remove member");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!task.title || !task.assigned_to) {
      return alert("Title and assigned user are required");
    }
    try {
      await API.post(`/tasks/${id}/create`, {
        ...task,
        assigned_to: parseInt(task.assigned_to),
      });
      setTask({ title: "", description: "", due_date: "", priority: "Medium", assigned_to: "" });
      setShowCreateTask(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create task");
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}/status?status=${encodeURIComponent(status)}`);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update status");
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  // ─── GROUP TASKS BY STATUS ──────────────────────────────────
  const todoTasks = tasks.filter((t) => t.status === "To Do");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const doneTasks = tasks.filter((t) => t.status === "Done");

  if (loading) {
    return (
      <div className="page">
        <div className="loading-spinner"><div className="spinner"></div>Loading project...</div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/dashboard")}>← Back</button>
            <h1 style={{ margin: 0 }}>{project?.name || `Project #${id}`}</h1>
          </div>
          <p>{project?.description}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreateTask(true)}>
            + New Task
          </button>
        )}
      </div>

      {/* ─── STATS BAR ──────────────────────────────────────── */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-icon purple">📊</div>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📝</div>
          <div className="stat-value">{todoTasks.length}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚡</div>
          <div className="stat-value">{inProgressTasks.length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-value">{doneTasks.length}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      {/* ─── SIDEBAR + BOARD ────────────────────────────────── */}
      <div className="section-grid">
        {/* ─── MEMBERS PANEL ─────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h2>Members ({members.length})</h2>
          </div>
          <div className="card-body">
            <div className="members-list">
              {members.map((m) => (
                <div key={m.id} className="member-item">
                  <div className="avatar">{m.name?.charAt(0).toUpperCase()}</div>
                  <div className="member-info">
                    <div className="name">{m.name}</div>
                    <div className="email">{m.email}</div>
                  </div>
                  {isAdmin && m.id !== currentUserId && (
                    <button className="btn btn-danger btn-sm" onClick={() => removeMember(m.id)}>✕</button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="add-member-row">
                <input
                  value={email}
                  placeholder="user@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMember()}
                />
                <button className="btn btn-primary btn-sm" onClick={addMember}>Add</button>
              </div>
            )}
          </div>
        </div>

        {/* ─── TASK BOARD ─────────────────────────────────────── */}
        <div>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No tasks yet. {isAdmin ? "Create the first task!" : "Waiting for admin to assign tasks."}</p>
            </div>
          ) : (
            <div className="tasks-columns">
              {/* TO DO */}
              <div className="task-column">
                <div className="task-column-header">
                  <span className="dot dot-todo"></span>
                  <h3>To Do</h3>
                  <span className="count">{todoTasks.length}</span>
                </div>
                {todoTasks.map((t) => (
                  <TaskCard key={t.id} t={t} isAdmin={isAdmin} currentUserId={currentUserId} updateStatus={updateStatus} />
                ))}
              </div>

              {/* IN PROGRESS */}
              <div className="task-column">
                <div className="task-column-header">
                  <span className="dot dot-progress"></span>
                  <h3>In Progress</h3>
                  <span className="count">{inProgressTasks.length}</span>
                </div>
                {inProgressTasks.map((t) => (
                  <TaskCard key={t.id} t={t} isAdmin={isAdmin} currentUserId={currentUserId} updateStatus={updateStatus} />
                ))}
              </div>

              {/* DONE */}
              <div className="task-column">
                <div className="task-column-header">
                  <span className="dot dot-done"></span>
                  <h3>Done</h3>
                  <span className="count">{doneTasks.length}</span>
                </div>
                {doneTasks.map((t) => (
                  <TaskCard key={t.id} t={t} isAdmin={isAdmin} currentUserId={currentUserId} updateStatus={updateStatus} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CREATE TASK MODAL ──────────────────────────────── */}
      {showCreateTask && (
        <div className="modal-overlay" onClick={() => setShowCreateTask(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h2>Create New Task</h2>
            <form onSubmit={createTask}>
              <div className="create-task-form">
                <div className="form-group full-width">
                  <label>Title</label>
                  <input
                    placeholder="Task title"
                    value={task.title}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <input
                    placeholder="What needs to be done?"
                    value={task.description}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={task.due_date}
                    onChange={(e) => setTask({ ...task, due_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={task.priority}
                    onChange={(e) => setTask({ ...task, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Assign To</label>
                  <select
                    value={task.assigned_to}
                    onChange={(e) => setTask({ ...task, assigned_to: e.target.value })}
                    required
                  >
                    <option value="">Select a member</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTask(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── TASK CARD COMPONENT ───────────────────────────────────────────────── */
function TaskCard({ t, isAdmin, currentUserId, updateStatus }) {
  const canUpdate = isAdmin || t.assigned_to === currentUserId;

  return (
    <div className="task-card">
      <h4>{t.title}</h4>
      {t.description && <div className="task-desc">{t.description}</div>}

      <div className="task-meta">
        <span className={`task-tag ${getPriorityClass(t.priority)}`}>{t.priority}</span>
        {t.due_date && (
          <span className={`task-due ${isOverdue(t.due_date) && t.status !== "Done" ? "overdue" : ""}`}>
            {isOverdue(t.due_date) && t.status !== "Done" ? "⚠ " : ""}
            {t.due_date}
          </span>
        )}
      </div>

      {t.assigned_user && (
        <div className="task-assignee">
          <div className="avatar">{t.assigned_user.name?.charAt(0).toUpperCase()}</div>
          <span>{t.assigned_user.name}</span>
        </div>
      )}

      <select
        value={t.status}
        disabled={!canUpdate}
        onChange={(e) => updateStatus(t.id, e.target.value)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}