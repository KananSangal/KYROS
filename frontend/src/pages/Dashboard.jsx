import { useEffect, useState } from "react";
import {
  Star,
  Trophy,
  Clock,
  Award,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [userResponse, childrenResponse] = await Promise.all([
        api.get("/auth/me"),
        api.get("/children"),
      ]);

      setUser(userResponse.data.user);

      const children = childrenResponse.data.children || [];

      if (children.length > 0) {
        setChild(children[0]);
      }
    } catch (error) {
      console.error("Unable to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-box">
          <p>Loading KYROS dashboard...</p>
        </div>
      </div>
    );
  }

  const childName = child?.name || "Your Child";
  const childInitial = childName.charAt(0).toUpperCase();

  const xp = child?.xp || 0;
  const level = child?.level || 1;
  const badges = child?.badges?.length || 0;

  return (
    <div className="page-content">

      <header className="dashboard-header">

        <div>
          <p className="eyebrow">PARENT DASHBOARD</p>

          <h1>
            Welcome back
            {user?.name ? `, ${user.name}` : ""}
          </h1>

          <p>
            Track your child's cultural learning journey with KYROS.
          </p>
        </div>

        <div className="header-profile">

          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "P"}
          </div>

          <div>
            <strong>{user?.name || "Parent"}</strong>
            <span>{user?.email || ""}</span>
          </div>

        </div>

      </header>

      <section className="dashboard-hero">

        <div className="hero-content">

          <p className="eyebrow">
            YOUR CHILD'S JOURNEY
          </p>

          <h2>
            {childName} is exploring India's culture.
          </h2>

          <p>
            Continue the journey through stories, languages,
            traditions, festivals and heritage.
          </p>

          <a
            href="/cultural-journey"
            className="hero-button"
          >
            Explore Cultural Journey
            <ChevronRight size={17} />
          </a>

        </div>

        <div className="hero-avatar">
          {childInitial}
        </div>

      </section>

      <section className="dashboard-stats">

        <div className="stat-card">

          <div className="stat-icon">
            <Star size={21} />
          </div>

          <div>
            <span>Total XP</span>
            <strong>{xp}</strong>
            <small>Learning points</small>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            <Award size={21} />
          </div>

          <div>
            <span>Current Level</span>
            <strong>{level}</strong>
            <small>Keep learning</small>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            <Trophy size={21} />
          </div>

          <div>
            <span>Badges Earned</span>
            <strong>{badges}</strong>
            <small>Achievements</small>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            <Clock size={21} />
          </div>

          <div>
            <span>Screen-free Time</span>
            <strong>0h</strong>
            <small>Tracked by KYROS</small>
          </div>

        </div>

      </section>

      <section className="dashboard-content-grid">

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <p className="eyebrow">
                CULTURAL JOURNEY
              </p>

              <h3>Explore India</h3>
            </div>

            <a href="/cultural-journey">
              View all
              <ChevronRight size={16} />
            </a>

          </div>

          <div className="journey-summary">

            <div className="journey-circle">
              <span>0</span>
              <small>/ 28</small>
            </div>

            <div className="journey-info">

              <strong>States explored</strong>

              <p>
                Begin exploring India's 28 states and discover
                their unique languages, festivals, food, arts
                and heritage.
              </p>

              <a href="/cultural-journey">
                Start exploring
                <ChevronRight size={15} />
              </a>

            </div>

          </div>

        </div>

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <p className="eyebrow">
                ACTIVITY
              </p>

              <h3>Recent Activity</h3>
            </div>

            <a href="/progress">
              View progress
              <ChevronRight size={16} />
            </a>

          </div>

          <div className="empty-activity">

            <Clock size={28} />

            <strong>No activity yet</strong>

            <p>
              Start a story, cultural lesson or quiz with
              KYROS to see activity here.
            </p>

          </div>

        </div>

      </section>

      <section className="dashboard-panel child-overview">

        <div className="panel-header">

          <div>
            <p className="eyebrow">
              CHILD PROFILE
            </p>

            <h3>{childName}</h3>
          </div>

          <a href="/children">
            Manage profile
            <ChevronRight size={16} />
          </a>

        </div>

        <div className="child-overview-content">

          <div className="overview-avatar">
            {childInitial}
          </div>

          <div className="overview-details">

            <strong>{childName}</strong>

            <span>
              Age {child?.age || "—"}
            </span>

          </div>

          <div className="overview-stat">
            <span>XP</span>
            <strong>{xp}</strong>
          </div>

          <div className="overview-stat">
            <span>Level</span>
            <strong>{level}</strong>
          </div>

          <div className="overview-stat">
            <span>Badges</span>
            <strong>{badges}</strong>
          </div>

        </div>

      </section>

    </div>
  );
}