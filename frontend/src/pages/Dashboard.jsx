import { useEffect, useState, useContext } from "react";
import { API } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { token, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/projects/my-projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async (projectId) => {
    try {
      const res = await API.get(`/dashboard/${projectId}`);
      setStats(res.data);
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setCreating(true);
    try {
      await API.post("/projects/", newProject);
      setShowModal(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
    } catch (err) {
      console.error("Create project error:", err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  useEffect(() => {
    if (selectedProject) fetchDashboard(selectedProject);
    else setStats(null);
  }, [selectedProject]);

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>Dashboard</h1>
          <p>Manage your projects and track progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {/* ─── PROJECT CARDS ──────────────────────────────────────── */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <p>No projects yet. Create your first project to get started!</p>
        </div>
      ) : (
        <div className="projects-grid" style={{ marginBottom: 32 }}>
          {projects.map((p) => (
            <div
              key={p.id}
              className="project-card"
              onClick={() => navigate(`/project/${p.id}`)}
              style={{ cursor: "pointer" }}
            >
              <h3>{p.name}</h3>
              <p>{p.description || "No description"}</p>
              <span className={`badge ${p.is_admin ? "badge-admin" : "badge-member"}`}>
                {p.is_admin ? "Admin" : "Member"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ─── DASHBOARD STATS ────────────────────────────────────── */}
      {projects.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2>Project Analytics</h2>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ width: 220 }}
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {stats ? (
            <div className="card-body">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">📊</div>
                  <div className="stat-value">{stats.total_tasks}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon blue">📝</div>
                  <div className="stat-value">{stats.status_breakdown?.todo || 0}</div>
                  <div className="stat-label">To Do</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange">⚡</div>
                  <div className="stat-value">{stats.status_breakdown?.in_progress || 0}</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">✅</div>
                  <div className="stat-value">{stats.status_breakdown?.done || 0}</div>
                  <div className="stat-label">Done</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon red">🔥</div>
                  <div className="stat-value">{stats.overdue}</div>
                  <div className="stat-label">Overdue</div>
                </div>
              </div>

              {stats.tasks_per_user?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Tasks Per User
                  </h3>
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Assigned Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.tasks_per_user.map((u) => (
                        <tr key={u.user_id}>
                          <td style={{ color: "var(--text-primary)" }}>{u.name}</td>
                          <td>{u.tasks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="card-body">
              <div className="empty-state" style={{ padding: "32px 0" }}>
                <p>Select a project above to view analytics</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── CREATE PROJECT MODAL ───────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Project Name</label>
                <input
                  placeholder="My Awesome Project"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Description</label>
                <input
                  placeholder="Brief description..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}