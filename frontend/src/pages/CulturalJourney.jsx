import { useEffect, useState } from "react";
import {
  Map,
  Search,
  MapPin,
  Languages,
  PartyPopper,
  Utensils,
  Music,
  Landmark,
  LoaderCircle,
  X,
} from "lucide-react";
import api from "../services/api";
import "./CulturalJourney.css";

export default function CulturalJourney() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoading(true);

      const response = await api.get("/cultural/states");

      setStates(response.data.states || []);
    } catch (err) {
      console.error("Unable to load states:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load cultural journey."
      );
    } finally {
      setLoading(false);
    }
  };

  const openState = async (state) => {
    try {
      setDetailLoading(true);

      const response = await api.get(
        `/cultural/states/${state._id}`
      );

      setSelectedState(
        response.data.state || state
      );
    } catch (err) {
      console.error("Unable to load state:", err);

      setSelectedState(state);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredStates = states.filter((state) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      state.name?.toLowerCase().includes(query) ||
      state.code?.toLowerCase().includes(query) ||
      state.capital?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="cultural-loading">
        <LoaderCircle className="cultural-spinner" size={28} />
        <span>Loading cultural journey...</span>
      </div>
    );
  }

  return (
    <div className="cultural-page">

      <div className="cultural-header">
        <div>
          <p className="cultural-eyebrow">
            KYROS · CULTURAL JOURNEY
          </p>

          <h1>Explore India's Culture</h1>

          <p>
            Discover the languages, festivals, food, arts
            and heritage of India's states.
          </p>
        </div>

        <div className="cultural-count">
          <Map size={19} />
          <strong>{states.length}</strong>
          <span>States</span>
        </div>
      </div>

      <div className="cultural-toolbar">
        <div className="cultural-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search state, capital or code..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </div>

      {error ? (
        <div className="cultural-error">
          <h2>Unable to load journey</h2>
          <p>{error}</p>

          <button onClick={loadStates}>
            Try Again
          </button>
        </div>
      ) : filteredStates.length === 0 ? (
        <div className="cultural-empty">
          <Map size={28} />
          <h2>No states found</h2>
          <p>Try another search.</p>
        </div>
      ) : (
        <div className="cultural-grid">
          {filteredStates.map((state) => (
            <button
              className="cultural-state-card"
              key={state._id}
              onClick={() => openState(state)}
            >
              <div className="state-card-top">
                <div className="state-code">
                  {state.code}
                </div>

                <MapPin size={16} />
              </div>

              <h2>{state.name}</h2>

              <p className="state-capital">
                Capital · {state.capital}
              </p>

              <div className="state-tags">
                {(state.languages || [])
                  .slice(0, 3)
                  .map((language) => (
                    <span key={language}>
                      {language}
                    </span>
                  ))}
              </div>

              <div className="state-card-footer">
                <span>Explore culture</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* STATE DETAIL MODAL */}

      {selectedState && (
        <div
          className="cultural-modal-overlay"
          onClick={() => setSelectedState(null)}
        >
          <div
            className="cultural-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="cultural-close"
              onClick={() => setSelectedState(null)}
            >
              <X size={19} />
            </button>

            {detailLoading ? (
              <div className="cultural-detail-loading">
                <LoaderCircle
                  className="cultural-spinner"
                  size={27}
                />
                <span>Loading state...</span>
              </div>
            ) : (
              <>
                <div className="state-detail-header">
                  <div className="state-detail-code">
                    {selectedState.code}
                  </div>

                  <div>
                    <p>INDIAN STATE</p>

                    <h2>
                      {selectedState.name}
                    </h2>

                    <span>
                      Capital · {selectedState.capital}
                    </span>
                  </div>
                </div>

                {selectedState.description && (
                  <p className="state-description">
                    {selectedState.description}
                  </p>
                )}

                <div className="state-detail-grid">

                  <div className="state-detail-section">
                    <div className="detail-icon">
                      <Languages size={18} />
                    </div>

                    <div>
                      <h3>Languages</h3>

                      <div className="detail-list">
                        {(selectedState.languages || [])
                          .map((item) => (
                            <span key={item}>
                              {item}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="state-detail-section">
                    <div className="detail-icon">
                      <PartyPopper size={18} />
                    </div>

                    <div>
                      <h3>Festivals</h3>

                      <div className="detail-list">
                        {(selectedState.festivals || [])
                          .map((item) => (
                            <span key={item}>
                              {item}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="state-detail-section">
                    <div className="detail-icon">
                      <Utensils size={18} />
                    </div>

                    <div>
                      <h3>Cuisine</h3>

                      <div className="detail-list">
                        {(selectedState.cuisine || [])
                          .map((item) => (
                            <span key={item}>
                              {item}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="state-detail-section">
                    <div className="detail-icon">
                      <Music size={18} />
                    </div>

                    <div>
                      <h3>Arts & Dance</h3>

                      <div className="detail-list">
                        {(selectedState.artsAndDance || [])
                          .map((item) => (
                            <span key={item}>
                              {item}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="state-detail-section full">
                    <div className="detail-icon">
                      <Landmark size={18} />
                    </div>

                    <div>
                      <h3>Heritage</h3>

                      <div className="detail-list">
                        {(selectedState.heritage || [])
                          .map((item) => (
                            <span key={item}>
                              {item}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                </div>

                {selectedState.greetings?.length > 0 && (
                  <div className="greeting-section">
                    <h3>Traditional Greetings</h3>

                    <div className="greeting-list">
                      {selectedState.greetings.map(
                        (greeting, index) => (
                          <div
                            className="greeting-card"
                            key={`${greeting.language}-${index}`}
                          >
                            <strong>
                              {greeting.text}
                            </strong>

                            <span>
                              {greeting.language}
                            </span>

                            {greeting.pronunciation && (
                              <small>
                                {greeting.pronunciation}
                              </small>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}