import { useEffect, useState } from "react";
import {
  Map,
  Search,
  Languages,
  Sparkles,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import api from "../services/api";

export default function CulturalJourney() {
  const [states, setStates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const response = await api.get("/cultural/states");
      setStates(response.data.states || []);
    } catch (error) {
      console.error("Unable to load states:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStates = states.filter((state) =>
    state.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">

      <header className="page-header">
        <div>
          <p className="eyebrow">CULTURAL JOURNEY</p>
          <h1>Explore India</h1>
          <p>
            Discover languages, greetings, festivals, food, arts and
            heritage from across India.
          </p>
        </div>

        <div className="journey-icon">
          <Map size={24} />
        </div>
      </header>

      <div className="journey-progress">
        <div className="progress-icon">
          <Sparkles size={20} />
        </div>

        <div>
          <strong>28 States Cultural Journey</strong>
          <p>
            Explore each state and unlock new cultural experiences.
          </p>
        </div>

        <div className="states-count">
          <strong>{states.length}</strong>
          <span>States</span>
        </div>
      </div>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search for a state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-box">
          <LoaderCircle className="spin" size={28} />
          <p>Loading India's cultural journey...</p>
        </div>
      ) : (
        <div className="states-grid">

          {filteredStates.map((state) => (
            <div className="state-card" key={state._id}>

              <div className="state-card-top">
                <div className="state-code">
                  {state.code}
                </div>

                <ChevronRight size={18} />
              </div>

              <h3>{state.name}</h3>

              <p className="capital">
                Capital · {state.capital}
              </p>

              <div className="state-languages">
                <Languages size={15} />

                <span>
                  {state.languages?.slice(0, 3).join(" · ")}
                </span>
              </div>

              <div className="state-tags">

                {state.festivals?.slice(0, 2).map((festival) => (
                  <span key={festival}>
                    {festival}
                  </span>
                ))}

              </div>

            </div>
          ))}

        </div>
      )}

      {!loading && filteredStates.length === 0 && (
        <div className="empty-state">
          <Map size={30} />
          <h3>No state found</h3>
          <p>Try searching with another state name.</p>
        </div>
      )}

    </div>
  );
}