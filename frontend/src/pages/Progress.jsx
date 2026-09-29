import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  BookOpen,
  Star,
  Trophy,
  Activity,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import api from "../services/api";
import "./Progress.css";

export default function Progress() {
  const [child, setChild] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const childrenResponse = await api.get("/children");

      const firstChild = childrenResponse.data.children?.[0];

      if (!firstChild) {
        setChild(null);
        setSessions([]);
        return;
      }

      setChild(firstChild);

      const sessionsResponse = await api.get(
        `/sessions/child/${firstChild._id}`
      );

      setSessions(sessionsResponse.data.sessions || []);
    } catch (err) {
      console.error("Unable to load progress:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load progress right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const completedSessions = useMemo(() => {
    return sessions.filter(
      (session) => session.status === "completed"
    );
  }, [sessions]);

  const totalScreenFreeSeconds = useMemo(() => {
    return completedSessions.reduce(
      (total, session) =>
        total + Number(session.durationSeconds || 0),
      0
    );
  }, [completedSessions]);

  const totalMinutes = Math.floor(
    totalScreenFreeSeconds / 60
  );

  const totalHours = Math.floor(totalMinutes / 60);

  const remainingMinutes = totalMinutes % 60;

  const screenFreeTime =
    totalHours > 0
      ? `${totalHours}h ${remainingMinutes}m`
      : `${totalMinutes}m`;

  const storySessions = completedSessions.filter(
    (session) => session.type === "story"
  ).length;

  const culturalSessions = completedSessions.filter(
    (session) =>
      session.type === "cultural" ||
      session.type === "greeting"
  ).length;

  const totalSessionXP = completedSessions.reduce(
    (total, session) =>
      total + Number(session.xpEarned || 0),
    0
  );

  const recentSessions = completedSessions.slice(0, 8);

  const formatDuration = (seconds) => {
    const value = Number(seconds || 0);

    if (value < 60) {
      return `${value}s`;
    }

    const minutes = Math.floor(value / 60);

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining > 0
      ? `${hours}h ${remaining}m`
      : `${hours}h`;
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="progress-page progress-loading">
        <LoaderCircle className="progress-spinner" size={28} />
        <p>Loading progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">
        <div className="progress-error">
          <h2>Unable to load progress</h2>
          <p>{error}</p>

          <button
            className="progress-retry-btn"
            onClick={loadProgress}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="progress-page">
        <div className="progress-empty">
          <div className="progress-empty-icon">
            <Sparkles size={28} />
          </div>

          <h2>No child profile yet</h2>

          <p>
            Add a child profile first to start tracking
            learning progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      {/* HEADER */}

      <div className="progress-header">
        <div>
          <p className="progress-eyebrow">
            KYROS · LEARNING ANALYTICS
          </p>

          <h1>{child.name}'s Progress</h1>

          <p className="progress-subtitle">
            Track screen-free learning, cultural activities,
            stories and achievements.
          </p>
        </div>

        <div className="progress-level-card">
          <div className="progress-level-icon">
            <Trophy size={22} />
          </div>

          <div>
            <span>Current Level</span>
            <strong>Level {child.level || 1}</strong>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}

      <div className="progress-stats-grid">
        <div className="progress-stat-card">
          <div className="progress-stat-icon xp">
            <Star size={21} />
          </div>

          <div>
            <span>Total XP</span>
            <strong>{child.xp || 0}</strong>
            <small>Learning points earned</small>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon sessions">
            <Activity size={21} />
          </div>

          <div>
            <span>Total Sessions</span>
            <strong>{completedSessions.length}</strong>
            <small>Completed interactions</small>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon stories">
            <BookOpen size={21} />
          </div>

          <div>
            <span>Stories Completed</span>
            <strong>{storySessions}</strong>
            <small>Story learning sessions</small>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon time">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Screen-Free Time</span>
            <strong>{screenFreeTime}</strong>
            <small>Interactive learning time</small>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="progress-main-grid">
        {/* XP PROGRESS */}

        <section className="progress-panel">
          <div className="progress-panel-header">
            <div>
              <p className="progress-panel-label">
                LEVEL PROGRESS
              </p>

              <h2>Learning journey</h2>
            </div>

            <div className="progress-xp-number">
              {child.xp || 0} XP
            </div>
          </div>

          <div className="level-summary">
            <div>
              <span>Current level</span>
              <strong>Level {child.level || 1}</strong>
            </div>

            <div className="level-next">
              <span>Next level</span>
              <strong>
                {(child.level || 1) * 100} XP
              </strong>
            </div>
          </div>

          <div className="xp-progress-track">
            <div
              className="xp-progress-fill"
              style={{
                width: `${Math.min(
                  ((child.xp || 0) % 100),
                  100
                )}%`,
              }}
            />
          </div>

          <p className="xp-progress-caption">
            {100 - ((child.xp || 0) % 100)} XP until the
            next level
          </p>
        </section>

        {/* ACTIVITY SUMMARY */}

        <section className="progress-panel">
          <div className="progress-panel-header">
            <div>
              <p className="progress-panel-label">
                ACTIVITY SUMMARY
              </p>

              <h2>Learning activity</h2>
            </div>

            <Activity size={21} />
          </div>

          <div className="activity-summary-list">
            <div className="activity-summary-row">
              <div>
                <BookOpen size={18} />
                <span>Story sessions</span>
              </div>

              <strong>{storySessions}</strong>
            </div>

            <div className="activity-summary-row">
              <div>
                <Sparkles size={18} />
                <span>Cultural sessions</span>
              </div>

              <strong>{culturalSessions}</strong>
            </div>

            <div className="activity-summary-row">
              <div>
                <Star size={18} />
                <span>Session XP earned</span>
              </div>

              <strong>{totalSessionXP} XP</strong>
            </div>

            <div className="activity-summary-row">
              <div>
                <Clock3 size={18} />
                <span>Screen-free time</span>
              </div>

              <strong>{screenFreeTime}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* RECENT ACTIVITY */}

      <section className="progress-panel recent-activity-panel">
        <div className="progress-panel-header">
          <div>
            <p className="progress-panel-label">
              RECENT ACTIVITY
            </p>

            <h2>Latest learning sessions</h2>
          </div>

          <span className="activity-count">
            {recentSessions.length} sessions
          </span>
        </div>

        {recentSessions.length === 0 ? (
          <div className="recent-empty">
            <Activity size={25} />

            <p>
              No completed sessions yet. Start a story or
              cultural activity to begin tracking progress.
            </p>
          </div>
        ) : (
          <div className="activity-table">
            {recentSessions.map((session) => (
              <div
                className="activity-row"
                key={session._id}
              >
                <div className="activity-row-icon">
                  {session.type === "story" ? (
                    <BookOpen size={19} />
                  ) : (
                    <Sparkles size={19} />
                  )}
                </div>

                <div className="activity-row-main">
                  <strong>
                    {session.title ||
                      session.type ||
                      "Learning Session"}
                  </strong>

                  <span>
                    {formatDate(session.endedAt)} ·{" "}
                    {session.language || "English"}
                  </span>
                </div>

                <div className="activity-row-duration">
                  <Clock3 size={15} />
                  {formatDuration(
                    session.durationSeconds
                  )}
                </div>

                <div className="activity-row-xp">
                  +{session.xpEarned || 0} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}