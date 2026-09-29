import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  Clock3,
  Star,
  X,
  Sparkles,
  LoaderCircle,
  Play,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import "./Stories.css";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [child, setChild] = useState(null);

  const [selectedStory, setSelectedStory] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const [completedStories, setCompletedStories] = useState(
    new Set()
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadStories();
    loadChild();
  }, []);

  // ==========================================
  // LOAD STORIES
  // ==========================================

  const loadStories = async () => {
    try {
      const response = await api.get("/stories");

      setStories(response.data.stories || []);
    } catch (error) {
      console.error("Unable to load stories:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD CHILD + COMPLETED STORIES
  // ==========================================

  const loadChild = async () => {
    try {
      const response = await api.get("/children");

      const firstChild = response.data.children?.[0];

      if (!firstChild) {
        return;
      }

      setChild(firstChild);

      // ------------------------------------------
      // Load locally saved completed stories
      // ------------------------------------------

      const storageKey = `kyros_completed_stories_${firstChild._id}`;

      const savedStories =
        JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );

      const completedSet = new Set(savedStories);

      // ------------------------------------------
      // Also check backend sessions
      // ------------------------------------------

      try {
        const sessionsResponse = await api.get(
          `/sessions/child/${firstChild._id}`
        );

        const sessions =
          sessionsResponse.data.sessions || [];

        sessions
          .filter(
            (session) =>
              session.type === "story" &&
              session.status === "completed"
          )
          .forEach((session) => {
            if (session.title) {
              completedSet.add(session.title);
            }
          });
      } catch (sessionError) {
        console.error(
          "Unable to load story sessions:",
          sessionError
        );
      }

      setCompletedStories(completedSet);

      // Save combined result locally
      localStorage.setItem(
        storageKey,
        JSON.stringify([...completedSet])
      );

    } catch (error) {
      console.error(
        "Unable to load child:",
        error
      );
    }
  };

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        stories
          .map((story) => story.category)
          .filter(Boolean)
      ),
    ];
  }, [stories]);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredStories = stories.filter((story) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      story.title
        ?.toLowerCase()
        .includes(searchText) ||
      story.description
        ?.toLowerCase()
        .includes(searchText);

    const matchesCategory =
      category === "all" ||
      story.category === category;

    return matchesSearch && matchesCategory;
  });

  // ==========================================
  // OPEN STORY
  // ==========================================

  const openStory = async (story) => {
    setSelectedStory(story);
    setActiveSession(null);
    setMessage("");

    if (!child) {
      setMessage(
        "Please create a child profile first."
      );
      return;
    }

    // Already completed
    if (completedStories.has(story.title)) {
      setMessage(
        "You have already completed this story."
      );
      return;
    }

    setStarting(true);

    try {
      const response = await api.post(
        "/sessions",
        {
          childId: child._id,
          type: "story",
          title: story.title,
          state: story.state || null,
          language: story.language || "English",
        }
      );

      if (response.data.session) {
        setActiveSession(
          response.data.session
        );
      }

    } catch (error) {
      console.error(
        "Unable to start story session:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to start this story session."
      );
    } finally {
      setStarting(false);
    }
  };

  // ==========================================
  // CLOSE STORY
  // ==========================================

  const closeStory = () => {
    if (completing) {
      return;
    }

    setSelectedStory(null);
    setActiveSession(null);
    setMessage("");
  };

  // ==========================================
  // COMPLETE STORY
  // ==========================================

  const completeStory = async () => {
    if (
      !selectedStory ||
      !child ||
      !activeSession ||
      completing
    ) {
      return;
    }

    setCompleting(true);
    setMessage("");

    try {
      // End backend session
      const response = await api.post(
        `/sessions/${activeSession._id}/end`
      );

      const earnedXP =
        response.data.session?.xpEarned || 0;

      const progress =
        response.data.progress;

      // ------------------------------------------
      // Update child XP
      // ------------------------------------------

      if (progress) {
        setChild((current) => ({
          ...current,
          xp: progress.xp,
          level: progress.level,
        }));
      } else {
        setChild((current) => ({
          ...current,
          xp: (current?.xp || 0) + earnedXP,
        }));
      }

      // ------------------------------------------
      // MARK STORY AS COMPLETED
      // ------------------------------------------

      const storyTitle =
        selectedStory.title;

      setCompletedStories((current) => {
        const updated = new Set(current);

        updated.add(storyTitle);

        // Save permanently for this child
        const storageKey =
          `kyros_completed_stories_${child._id}`;

        localStorage.setItem(
          storageKey,
          JSON.stringify([...updated])
        );

        return updated;
      });

      // ------------------------------------------
      // SUCCESS MESSAGE
      // ------------------------------------------

      setMessage(
        `Story completed! +${earnedXP} XP`
      );

      // Close modal
      setTimeout(() => {
        setSelectedStory(null);
        setActiveSession(null);
        setMessage("");
      }, 1800);

    } catch (error) {
      console.error(
        "Unable to complete story:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to complete this story session."
      );
    } finally {
      setCompleting(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="page-content stories-page">

      {/* HEADER */}
      <header className="page-header stories-header">

        <div>
          <p className="eyebrow">
            STORY WORLD
          </p>

          <h1>Cultural Stories</h1>

          <p>
            Discover stories from Indian mythology,
            traditions and cultural heritage.
          </p>
        </div>

        {child && (
          <div className="stories-xp-pill">
            <Star size={16} />

            <strong>
              {child.xp || 0} XP
            </strong>
          </div>
        )}

      </header>


      {/* SEARCH */}
      <div className="stories-toolbar">

        <div className="stories-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        {/* CATEGORIES */}
        <div className="stories-categories">

          <button
            type="button"
            className={
              category === "all"
                ? "story-category active"
                : "story-category"
            }
            onClick={() =>
              setCategory("all")
            }
          >
            All
          </button>

          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={
                category === item
                  ? "story-category active"
                  : "story-category"
              }
              onClick={() =>
                setCategory(item)
              }
            >
              {item.replaceAll("_", " ")}
            </button>
          ))}

        </div>

      </div>


      {/* LOADING */}
      {loading && (
        <div className="stories-empty">

          <LoaderCircle
            size={30}
            className="stories-spin"
          />

          <p>
            Loading stories...
          </p>

        </div>
      )}


      {/* EMPTY */}
      {!loading &&
        filteredStories.length === 0 && (
          <div className="stories-empty">

            <BookOpen size={42} />

            <h3>
              No stories found
            </h3>

            <p>
              Try another search or category.
            </p>

          </div>
        )}


      {/* STORIES */}
      {!loading &&
        filteredStories.length > 0 && (
          <div className="stories-grid">

            {filteredStories.map((story) => {

              const isCompleted =
                completedStories.has(
                  story.title
                );

              return (
                <article
                  key={story._id}
                  className={
                    isCompleted
                      ? "story-card completed"
                      : "story-card"
                  }
                >

                  {/* ICON */}
                  <div
                    className={
                      isCompleted
                        ? "story-card-icon completed"
                        : "story-card-icon"
                    }
                  >
                    {isCompleted ? (
                      <CheckCircle2
                        size={25}
                      />
                    ) : (
                      <BookOpen
                        size={25}
                      />
                    )}
                  </div>


                  {/* CONTENT */}
                  <div className="story-card-content">

                    <div className="story-card-top">

                      <span className="story-category-label">
                        {story.category?.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                      {isCompleted && (
                        <span className="story-completed-label">
                          Completed
                        </span>
                      )}

                    </div>


                    <h3>
                      {story.title}
                    </h3>

                    <p>
                      {story.description}
                    </p>


                    <div className="story-meta">

                      <span>
                        <Clock3 size={14} />

                        Cultural Story
                      </span>

                      <span>
                        <Sparkles size={14} />

                        Earn XP
                      </span>

                    </div>

                  </div>


                  {/* BUTTON */}
                  <button
                    type="button"
                    className={
                      isCompleted
                        ? "story-open-btn completed"
                        : "story-open-btn"
                    }
                    onClick={() =>
                      openStory(story)
                    }
                  >

                    {isCompleted ? (
                      <>
                        <CheckCircle2
                          size={16}
                        />

                        Completed
                      </>
                    ) : (
                      <>
                        <Play size={16} />

                        Read Story
                      </>
                    )}

                  </button>

                </article>
              );
            })}

          </div>
        )}


      {/* MODAL */}
      {selectedStory && (
        <div
          className="story-modal-overlay"
          onClick={closeStory}
        >

          <div
            className="story-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="story-modal-header">

              <div>

                <span className="story-modal-category">
                  {selectedStory.category?.replaceAll(
                    "_",
                    " "
                  )}
                </span>

                <h2>
                  {selectedStory.title}
                </h2>

              </div>


              <button
                type="button"
                className="story-close-btn"
                onClick={closeStory}
                disabled={completing}
              >
                <X size={20} />
              </button>

            </div>


            {/* CONTENT */}
            <div className="story-modal-content">

              {starting ? (
                <div className="story-loading">

                  <LoaderCircle
                    size={28}
                    className="stories-spin"
                  />

                  <p>
                    Starting story...
                  </p>

                </div>
              ) : (
                <p>
                  {selectedStory.content}
                </p>
              )}

            </div>


            {/* MESSAGE */}
            {message && (
              <div
                className={
                  message.includes(
                    "Story completed!"
                  )
                    ? "story-message success"
                    : "story-message"
                }
              >

                {message.includes(
                  "Story completed!"
                ) ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Sparkles size={18} />
                )}

                <span>
                  {message}
                </span>

              </div>
            )}


            {/* FOOTER */}
            <div className="story-modal-footer">

              {completedStories.has(
                selectedStory.title
              ) ? (

                <>
                  <div className="story-completed-info">

                    <CheckCircle2
                      size={20}
                    />

                    <div>

                      <strong>
                        Story completed
                      </strong>

                      <span>
                        This story has already
                        been completed.
                      </span>

                    </div>

                  </div>


                  <button
                    type="button"
                    className="story-done-btn"
                    onClick={closeStory}
                  >
                    Done
                  </button>
                </>

              ) : (

                <>

                  <div className="story-session-info">

                    <Sparkles size={19} />

                    <span>
                      Complete this story to
                      earn XP and track progress.
                    </span>

                  </div>


                  <button
                    type="button"
                    className="story-complete-btn"
                    onClick={completeStory}
                    disabled={
                      completing ||
                      starting ||
                      !activeSession
                    }
                  >

                    {completing ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="stories-spin"
                        />

                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={18}
                        />

                        Complete Story
                      </>
                    )}

                  </button>

                </>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}