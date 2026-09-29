import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Map,
  BookOpen,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("kyros_token");
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <div className="sidebar-logo">K</div>

        <div>
          <h2>KYROS</h2>
          <span>Smart Cultural Companion</span>
        </div>
      </div>

      <nav className="sidebar-nav">

        <NavLink to="/dashboard" className={navClass}>
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink to="/children" className={navClass}>
          <Users size={19} />
          Children
        </NavLink>

        <NavLink to="/cultural-journey" className={navClass}>
          <Map size={19} />
          Cultural Journey
        </NavLink>

        <NavLink to="/stories" className={navClass}>
          <BookOpen size={19} />
          Stories
        </NavLink>

        <NavLink to="/achievements" className={navClass}>
          <Trophy size={19} />
          Achievements
        </NavLink>

        <NavLink to="/progress" className={navClass}>
          <BarChart3 size={19} />
          Progress
        </NavLink>

      </nav>

      <div className="sidebar-bottom">

        <div className="theme-control">

          <div className="theme-control-header">
            <span>Theme</span>
            <span className="theme-current">
              {theme === "system"
                ? "System"
                : theme === "light"
                ? "Light"
                : "Dark"}
            </span>
          </div>

          <div className="theme-options">

            <button
              className={theme === "system" ? "selected" : ""}
              onClick={() => setTheme("system")}
              title="Use system theme"
            >
              <Monitor size={15} />
            </button>

            <button
              className={theme === "light" ? "selected" : ""}
              onClick={() => setTheme("light")}
              title="Light theme"
            >
              <Sun size={15} />
            </button>

            <button
              className={theme === "dark" ? "selected" : ""}
              onClick={() => setTheme("dark")}
              title="Dark theme"
            >
              <Moon size={15} />
            </button>

          </div>

        </div>

        <NavLink to="/settings" className={navClass}>
          <Settings size={19} />
          Settings
        </NavLink>

        <button
          className="nav-item logout-button"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          Sign Out
        </button>

      </div>

    </aside>
  );
}