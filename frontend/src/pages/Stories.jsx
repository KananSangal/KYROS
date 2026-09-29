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

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [child, setChild] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadStories();
    loadChild();
  }, []);

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

  const loadChild = async () => {
    try {
      const response = await api.get("/children");

      const firstChild = response.data.children?.[0];

      if (firstChild) {
        setChild(firstChild);
      }
    } catch (error) {
      console.error("Unable to load child:", error);
    }
  };

  const categories = useMemo(() => {
    const unique = [
      ...new Set(stories.map((story) => story.category).filter(Boolean)),
    ];

    return unique;
  }, [stories]);

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title?.toLowerCase().includes(search.toLowerCase()) ||
      story.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || story.category === category;

    return matchesSearch && matchesCategory;
  });

  const openStory = (story) => {
    setMessage("");
    setSelectedStory(story);
  };

  const closeStory = () => {
    if (!completing) {
      setSelectedStory(null);
      setMessage("");
    }
  };

  const completeStory = async () => {
    if (!selectedStory || !child || completing) return;

    setCompleting(true);
    setMessage("");

    try {
      const duration = 120;

      await api.post("/sessions", {
        childId: child._id,
        type: "story",
        state: selectedStory.state || null,
        language: selectedStory.language || "English",
        duration,
        status: "completed",
      });

      const xpResponse = await api.post(
        `/progress/${child._id}/xp`,
        {
          amount: 10,
          reason: `Completed story: ${selectedStory.title}`,
        }
      );

      const updatedChild = xpResponse.data.child;

      if (updatedChild) {
        setChild(updatedChild);
      } else {
        setChild((current) => ({
          ...current,
          xp: (current?.xp || 0) + 10,
        }));
      }

      setMessage("Story completed! +10 XP ⭐");

      setTimeout(() => {
        setSelectedStory(null);
        setMessage("");
      }, 1300);
    } catch (error) {
      console.error("Unable to complete story:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to save this story session."
      );
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="page-content">

      <header className="page-header stories-page-header">
        <div>
          <p className="eyebrow">STORY WORLD</p>

          <h1>Stories with KYROS</h1>

          <p>
            Explore stories, legends and little lessons from India's
            rich cultural traditions.
          </p>
        </div>

        {child && (
          <div className="stories-child-pill">
            <div className="stories-child-avatar">
              {child.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{child.name}</strong>
              <span>
                <Star size={12} />
                {child.xp || 0} XP
              </span>
            </div>
          </div>
        )}
      </header>


      <div className="stories-toolbar">

        <div className="stories-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="story-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All stories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item
                .replaceAll("_", " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </option>
          ))}
        </select>

      </div>


      {loading ? (
        <div className="loading-box">
          <LoaderCircle className="spin" size={28} />
          <p>Loading story world...</p>
        </div>
      ) : filteredStories.length === 0 ? (

        <div className="empty-state">
          <BookOpen size={32} />

          <h3>No stories found</h3>

          <p>
            Try another search or choose a different category.
          </p>
        </div>

      ) : (

        <div className="stories-grid">

          {filteredStories.map((story) => (

            <article
              className="story-card"
              key={story._id}
            >

              <div className="story-card-top">

                <div className="story-card-icon">
                  <BookOpen size={20} />
                </div>

                <span className="story-category">
                  {story.category?.replaceAll("_", " ")}
                </span>

              </div>


              <h3>{story.title}</h3>

              <p>
                {story.description}
              </p>


              <div className="story-meta">

                <span>
                  <Clock3 size={12} />
                  Ages {story.ageMin || 5}–{story.ageMax || 14}
                </span>

                <span>
                  {story.language || "English"}
                </span>

              </div>


              <button
                className="story-open-button"
                onClick={() => openStory(story)}
              >
                <Play size={15} />
                Explore Story
              </button>

            </article>

          ))}

        </div>

      )}


      {selectedStory && (

        <div
          className="story-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeStory();
            }
          }}
        >

          <div className="story-modal">

            <button
              className="story-modal-close"
              onClick={closeStory}
              disabled={completing}
            >
              <X size={19} />
            </button>


            <div className="story-modal-icon">
              <BookOpen size={25} />
            </div>


            <p className="eyebrow">
              {selectedStory.category?.replaceAll("_", " ")}
            </p>

            <h2>{selectedStory.title}</h2>

            <div className="story-modal-meta">
              <span>
                Ages {selectedStory.ageMin || 5}–
                {selectedStory.ageMax || 14}
              </span>

              <span>
                {selectedStory.language || "English"}
              </span>

              {selectedStory.state && (
                <span>{selectedStory.state}</span>
              )}
            </div>


            <div className="story-content">

              {selectedStory.content
                ?.split(/\n+/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}

            </div>


            {message && (
              <div className="story-success-message">
                {message}
              </div>
            )}


            <div className="story-modal-footer">

              <div className="story-reward">
                <Sparkles size={17} />
                <span>Complete this story</span>
                <strong>+10 XP</strong>
              </div>

              <button
                className="story-complete-button"
                onClick={completeStory}
                disabled={completing || !child}
              >
                {completing ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Mark Complete
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}