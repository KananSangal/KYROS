import { useEffect, useState } from "react";
import {
  Trophy,
  Lock,
  Star,
  Sparkles,
  LoaderCircle,
  Award,
} from "lucide-react";
import api from "../services/api";

export default function Achievements() {
  const [badges, setBadges] = useState([]);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
  try {
    const [childrenResponse, badgesResponse] = await Promise.all([
      api.get("/children"),
      api.get("/badges"),
    ]);

    const firstChild = childrenResponse.data.children?.[0];
    const allBadges = badgesResponse.data.badges || [];

    if (!firstChild) {
      setBadges([]);
      setLoading(false);
      return;
    }

    setChild(firstChild);

    const earnedBadgeIds = new Set(
      (firstChild.badges || []).map((item) =>
        typeof item.badge === "object" ? item.badge._id : item.badge
      )
    );

    const badgesWithStatus = allBadges.map((badge) => ({
      ...badge,
      earned: earnedBadgeIds.has(badge._id),
    }));

    setBadges(badgesWithStatus);
  } catch (error) {
    console.error("Unable to load achievements:", error);
  } finally {
    setLoading(false);
  }
};

  const earnedCount = badges.filter(
    (badge) => badge.earned || badge.isEarned
  ).length;

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <p className="eyebrow">ACHIEVEMENTS</p>
          <h1>Badges & Achievements</h1>
          <p>
            Celebrate every milestone in your child's KYROS journey.
          </p>
        </div>

        {child && (
          <div className="achievement-xp-pill">
            <Star size={16} />
            <strong>{child.xp || 0} XP</strong>
          </div>
        )}
      </header>

      {loading ? (
        <div className="loading-box">
          <LoaderCircle className="spin" size={28} />
          <p>Loading achievements...</p>
        </div>
      ) : !child ? (
        <div className="empty-state">
          <Award size={34} />
          <h3>No child profile found</h3>
          <p>
            Add a child profile first to start earning achievements.
          </p>
        </div>
      ) : badges.length === 0 ? (
        <div className="empty-state">
          <Trophy size={34} />
          <h3>No achievements yet</h3>
          <p>
            Complete stories, cultural activities and challenges to
            earn badges.
          </p>
        </div>
      ) : (
        <>
          <div className="achievement-summary">
            <div className="achievement-summary-card">
              <div className="achievement-summary-icon">
                <Trophy size={20} />
              </div>
              <div>
                <span>Badges earned</span>
                <strong>
                  {earnedCount} / {badges.length}
                </strong>
              </div>
            </div>

            <div className="achievement-summary-card">
              <div className="achievement-summary-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <span>Current level</span>
                <strong>Level {child.level || 1}</strong>
              </div>
            </div>

            <div className="achievement-summary-card">
              <div className="achievement-summary-icon">
                <Star size={20} />
              </div>
              <div>
                <span>Total XP</span>
                <strong>{child.xp || 0} XP</strong>
              </div>
            </div>
          </div>

          <div className="achievements-grid">
            {badges.map((badge) => {
              const earned = badge.earned || badge.isEarned;

              return (
                <article
                  className={`achievement-card ${
                    earned ? "earned" : "locked"
                  }`}
                  key={badge._id}
                >
                  <div className="achievement-icon">
                    {earned ? (
                      badge.icon || <Trophy size={28} />
                    ) : (
                      <Lock size={25} />
                    )}
                  </div>

                  <div className="achievement-content">
                    <div className="achievement-card-top">
                      <span
                        className={`achievement-status ${
                          earned ? "earned-status" : "locked-status"
                        }`}
                      >
                        {earned ? "Earned" : "Locked"}
                      </span>

                      <span className="achievement-xp">
                        +{badge.xpReward || 0} XP
                      </span>
                    </div>

                    <h3>{badge.name}</h3>

                    <p>
                      {badge.description ||
                        "Keep exploring KYROS to unlock this achievement."}
                    </p>

                    {badge.requirement && (
                      <div className="achievement-requirement">
                        {badge.requirement}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}