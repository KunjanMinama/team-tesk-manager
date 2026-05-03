import { useEffect, useState, useContext } from "react";
import { API } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const { token } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  const fetchProjects = async () => {
    const res = await API.get("/projects/my-projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProjects(res.data.projects);
  };

  const createProject = async (e) => {
    e.preventDefault();
    await API.post("/projects/", newProject, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Project created!");
    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Projects</h1>

      <h3>Create New Project</h3>
      <form onSubmit={createProject}>
        <input
          placeholder="Project Name"
          onChange={(e) =>
            setNewProject({ ...newProject, name: e.target.value })
          }
        />
        <input
          placeholder="Description"
          onChange={(e) =>
            setNewProject({ ...newProject, description: e.target.value })
          }
        />
        <button type="submit">Create</button>
      </form>

      <h3 style={{ marginTop: 20 }}>Your Projects</h3>
      {projects.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginTop: 10,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/project/${p.id}`)}
        >
          <h4>{p.name}</h4>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  );
}