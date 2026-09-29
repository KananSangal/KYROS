import { useEffect, useState } from "react";
import { UserPlus, Users, Star, Trophy, X, LoaderCircle } from "lucide-react";
import api from "../services/api";

export default function Children() {
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await api.get("/children");
      setChildren(response.data.children || []);
    } catch (error) {
      console.error("Unable to load children:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setName("");
    setAge("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setError("");
    }
  };

  const handleAddChild = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter the child's name.");
      return;
    }

    if (!age || Number(age) < 1 || Number(age) > 18) {
      setError("Please enter an age between 1 and 18.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await api.post("/children", {
        name: name.trim(),
        age: Number(age),
      });

      const newChild = response.data.child;

      if (newChild) {
        setChildren((current) => [newChild, ...current]);
      } else {
        await loadChildren();
      }

      setShowModal(false);
      setName("");
      setAge("");
    } catch (error) {
      console.error("Unable to create child:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create the child profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <p className="eyebrow">CHILDREN</p>
          <h1>My Children</h1>
          <p>Manage your children's KYROS learning profiles.</p>
        </div>

        <button className="primary-button" onClick={openModal}>
          <UserPlus size={17} />
          Add Child
        </button>
      </header>

      {loading ? (
        <div className="loading-box">
          <LoaderCircle className="spin" size={28} />
          <p>Loading children...</p>
        </div>
      ) : children.length === 0 ? (
        <div className="empty-state">
          <Users size={34} />
          <h3>No child profiles yet</h3>
          <p>Add your first child to start their KYROS journey.</p>

          <button className="primary-button" onClick={openModal}>
            <UserPlus size={17} />
            Add Child
          </button>
        </div>
      ) : (
        <div className="children-grid">
          {children.map((child) => (
            <div className="child-card" key={child._id}>
              <div className="child-card-header">
                <div className="large-child-avatar">
                  {child.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2>{child.name}</h2>
                  <p>Age {child.age}</p>
                </div>
              </div>

              <div className="child-card-stats">
                <div>
                  <Star size={17} />
                  <span>XP</span>
                  <strong>{child.xp || 0}</strong>
                </div>

                <div>
                  <Trophy size={17} />
                  <span>Level</span>
                  <strong>{child.level || 1}</strong>
                </div>

                <div>
                  <Users size={17} />
                  <span>Badges</span>
                  <strong>{child.badges?.length || 0}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="child-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="child-modal">
            <button
              className="child-modal-close"
              onClick={closeModal}
              disabled={saving}
              type="button"
            >
              <X size={19} />
            </button>

            <div className="child-modal-icon">
              <UserPlus size={22} />
            </div>

            <p className="eyebrow">NEW PROFILE</p>
            <h2>Add a Child</h2>
            <p className="child-modal-description">
              Create a profile to track your child's KYROS learning journey.
            </p>

            <form onSubmit={handleAddChild}>
              <label htmlFor="child-name">Child's Name</label>
              <input
                id="child-name"
                type="text"
                placeholder="Enter child's name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />

              <label htmlFor="child-age">Age</label>
              <input
                id="child-age"
                type="number"
                min="1"
                max="18"
                placeholder="Enter age"
                value={age}
                onChange={(event) => setAge(event.target.value)}
              />

              {error && <div className="error-message">{error}</div>}

              <div className="child-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={16} className="spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Create Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}