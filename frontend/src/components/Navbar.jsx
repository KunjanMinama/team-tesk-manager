import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <div className="logo-icon">📋</div>
        TaskFlow
      </Link>

      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        {user && (
          <span className="nav-user">
            {user.name} • {role === "admin" ? "Admin" : "Member"}
          </span>
        )}
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}