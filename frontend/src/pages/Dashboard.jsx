import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  Clock3,
  Star,
  Trophy,
  Sparkles,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const childrenResponse = await api.get("/children");
      const firstChild = childrenResponse.data.children?.[0];

      if (!firstChild) {
        setChild(null);
        setSessions([]);
        setBadges([]);
        return;
      }

      setChild(firstChild);

      const [sessionsResponse, badgesResponse] =
        await Promise.all([
          api.get(`/sessions/child/${firstChild._id}`),
          api.get("/badges"),
        ]);

      setSessions(sessionsResponse.data.sessions || []);
      setBadges(badgesResponse.data.badges || []);
    } catch (err) {
      console.error("Unable to load dashboard:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const completedSessions = useMemo(
    () =>
      sessions.filter(
        (session) => session.status === "completed"
      ),
    [sessions]
  );

  const storyCount = useMemo(
    () =>
      completedSessions.filter(
        (session) => session.type === "story"
      ).length,
    [completedSessions]
  );

  const totalScreenFreeSeconds = useMemo(
    () =>
      completedSessions.reduce(
        (total, session) =>
          total + Number(session.durationSeconds || 0),
        0
      ),
    [completedSessions]
  );

  const totalMinutes = Math.floor(
    totalScreenFreeSeconds / 60
  );

  const screenFreeTime =
    totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}h ${
          totalMinutes % 60
        }m`
      : `${totalMinutes}m`;

  const earnedBadges = useMemo(() => {
    if (!child?.badges) return [];

    const earnedIds = new Set(
      child.badges.map((item) =>
        typeof item.badge === "object"
          ? item.badge._id
          : item.badge
      )
    );

    return badges.filter((badge) =>
      earnedIds.has(badge._id)
    );
  }, [child, badges]);

  const recentSessions = completedSessions.slice(0, 5);

  const formatDuration = (seconds) => {
    const value = Number(seconds || 0);

    if (value < 60) return `${value}s`;

    const minutes = Math.floor(value / 60);

    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining
      ? `${hours}h ${remaining}m`
      : `${hours}h`;
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoaderCircle
          size={28}
          className="dashboard-spinner"
        />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>

          <button onClick={loadDashboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">
            <Sparkles size={28} />
          </div>

          <h2>Welcome to KYROS</h2>

          <p>
            Add a child profile to start the cultural
            learning journey.
          </p>

          <button
            onClick={() => navigate("/children")}
          >
            Add Child
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            KYROS · PARENT DASHBOARD
          </p>

          <h1>
            Welcome back, Parent 👋
          </h1>

          <p>
            Here's how {child.name}'s learning journey is
            progressing.
          </p>
        </div>

        <div className="dashboard-level">
          <div className="dashboard-level-icon">
            <Trophy size={21} />
          </div>

          <div>
            <span>Current Level</span>
            <strong>
              Level {child.level || 1}
            </strong>
          </div>
        </div>
      </div>

      {/* CHILD SUMMARY */}

      <section className="dashboard-child-card">
        <div className="dashboard-child-avatar">
          {child.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="dashboard-child-info">
          <h2>{child.name}</h2>

          <p>
            Age {child.age} · Learning with KYROS
          </p>
        </div>

        <div className="dashboard-child-xp">
          <Star size={17} />
          <strong>{child.xp || 0} XP</strong>
        </div>
      </section>

      {/* STAT CARDS */}

      <div className="dashboard-stats">

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon">
            <Star size={20} />
          </div>

          <div>
            <span>Total XP</span>
            <strong>{child.xp || 0}</strong>
            <small>Learning points</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>Sessions</span>
            <strong>{completedSessions.length}</strong>
            <small>Completed interactions</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon">
            <BookOpen size={20} />
          </div>

          <div>
            <span>Stories</span>
            <strong>{storyCount}</strong>
            <small>Stories completed</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Screen-Free</span>
            <strong>{screenFreeTime}</strong>
            <small>Interactive learning</small>
          </div>
        </div>

      </div>

      {/* MAIN GRID */}

      <div className="dashboard-main-grid">

        {/* RECENT ACTIVITY */}

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p>RECENT ACTIVITY</p>
              <h2>Learning sessions</h2>
            </div>

            <button
              className="dashboard-link"
              onClick={() => navigate("/progress")}
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          {recentSessions.length === 0 ? (
            <div className="dashboard-no-activity">
              <Activity size={25} />

              <strong>No activity yet</strong>

              <span>
                Start a story or cultural activity to
                begin tracking progress.
              </span>
            </div>
          ) : (
            <div className="dashboard-activity-list">
              {recentSessions.map((session) => (
                <div
                  className="dashboard-activity"
                  key={session._id}
                >
                  <div className="dashboard-activity-icon">
                    {session.type === "story" ? (
                      <BookOpen size={17} />
                    ) : (
                      <Sparkles size={17} />
                    )}
                  </div>

                  <div className="dashboard-activity-content">
                    <strong>
                      {session.title ||
                        "Learning Session"}
                    </strong>

                    <span>
                      {formatDate(session.endedAt)} ·{" "}
                      {formatDuration(
                        session.durationSeconds
                      )}
                    </span>
                  </div>

                  <div className="dashboard-activity-xp">
                    +{session.xpEarned || 0} XP
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ACHIEVEMENTS */}

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p>ACHIEVEMENTS</p>
              <h2>Badges earned</h2>
            </div>

            <button
              className="dashboard-link"
              onClick={() =>
                navigate("/achievements")
              }
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          {earnedBadges.length === 0 ? (
            <div className="dashboard-no-activity">
              <Trophy size={25} />

              <strong>No badges yet</strong>

              <span>
                Complete activities to unlock your first
                achievement.
              </span>
            </div>
          ) : (
            <div className="dashboard-badges">
              {earnedBadges
                .slice(0, 4)
                .map((badge) => (
                  <div
                    className="dashboard-badge"
                    key={badge._id}
                  >
                    <div className="dashboard-badge-icon">
                      {badge.icon || "🏆"}
                    </div>

                    <div>
                      <strong>{badge.name}</strong>

                      <span>
                        {badge.description}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

      </div>

      {/* QUICK ACTIONS */}

      <section className="dashboard-panel dashboard-actions-panel">

        <div className="dashboard-panel-header">
          <div>
            <p>QUICK ACTIONS</p>
            <h2>Continue the journey</h2>
          </div>
        </div>

        <div className="dashboard-actions">

          <button
            onClick={() => navigate("/stories")}
          >
            <div className="dashboard-action-icon">
              <BookOpen size={20} />
            </div>

            <div>
              <strong>Explore Stories</strong>
              <span>
                Discover Indian stories and traditions
              </span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            onClick={() =>
              navigate("/cultural-journey")
            }
          >
            <div className="dashboard-action-icon">
              <Sparkles size={20} />
            </div>

            <div>
              <strong>Cultural Journey</strong>
              <span>
                Explore India's states and cultures
              </span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            onClick={() => navigate("/progress")}
          >
            <div className="dashboard-action-icon">
              <Activity size={20} />
            </div>

            <div>
              <strong>View Progress</strong>
              <span>
                See detailed learning analytics
              </span>
            </div>

            <ArrowRight size={17} />
          </button>

        </div>
      </section>

    </div>
  );
}