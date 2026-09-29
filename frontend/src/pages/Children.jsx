import { useEffect, useState } from "react";
import { UserPlus, Users, Star, Trophy } from "lucide-react";
import api from "../services/api";

export default function Children() {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await api.get("/children");
      setChildren(response.data.children || []);
    } catch (error) {
      console.error("Unable to load children:", error);
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

        <button className="primary-button">
          <UserPlus size={17} />
          Add Child
        </button>
      </header>

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

    </div>
  );
}