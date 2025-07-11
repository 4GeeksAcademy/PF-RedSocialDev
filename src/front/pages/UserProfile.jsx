import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const UserProfile = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myPosts, setMyPosts] = useState([]);

  // Redirigir si no hay usuario
  useEffect(() => {
    if (!store.user) {
      navigate("/login");
    } else {
      fetchProfile();
      fetchMyPosts();
      fetchFavorites();
    }
  }, [store.user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/my-posts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/my-favorites", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  if (!profile) return <p className="text-white p-5">Loading profile...</p>;

  return (
    <div className="bg-black text-white min-vh-100 p-3">
      <div className="card bg-dark text-white shadow-lg">
        <div className="position-relative">
          <img
            src="https://images.unsplash.com/photo-1503264116251-35a269479413"
            alt="Banner"
            className="card-img-top"
            style={{ height: "200px", objectFit: "cover" }}
          />
          <img
            src="https://avatars.githubusercontent.com/u/000000?v=4"
            alt="Avatar"
            className="rounded-circle border border-3 border-white position-absolute"
            style={{
              width: "120px",
              height: "120px",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: "-60px"
            }}
          />
        </div>

        <div className="card-body text-center mt-5 pt-4">
          <h3 className="card-title">{profile.username}</h3>
          <p className="text-muted fst-italic">{profile.bio || "No bio yet"}</p>

          <div className="d-flex justify-content-center flex-wrap gap-2 my-3">
            {profile.stack?.split(",").map(skill => (
              <span key={skill} className="badge bg-primary">{skill.trim()}</span>
            ))}
          </div>

          <p className="mb-1"><strong>Level:</strong> {profile.level}</p>
          <p className="mb-1"><strong>Email:</strong> {profile.email}</p>
          <p className="mb-2 text-secondary">Member since: {profile.join_date?.slice(0, 10)}</p>

          <div className="mt-3 d-flex justify-content-center gap-3">
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer">
                <i className="fab fa-github fa-lg text-white"></i>
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin fa-lg text-white"></i>
              </a>
            )}
            {profile.portfolio && (
              <a href={profile.portfolio} target="_blank" rel="noreferrer">
                <i className="fas fa-globe fa-lg text-white"></i>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 style={{ color: "#2563eb" }}>My Posts</h4>
        {myPosts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {myPosts.map(post => (
              <li key={post.id} className="list-group-item bg-black text-white d-flex justify-content-between align-items-center">
                <div>
                  <strong>{post.title}</strong> <small className="text-muted">({post.stack})</small>
                </div>
                <a href={post.github} className="btn btn-sm btn-outline-info" target="_blank" rel="noreferrer">
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <h4 style={{ color: "#2563eb" }}>My Favorites</h4>
        {favorites.length === 0 ? (
          <p>No favorites yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {favorites.map(post => (
              <li key={post.id} className="list-group-item bg-black text-white d-flex justify-content-between align-items-center">
                <div>
                  <strong>{post.title}</strong> <small className="text-muted">({post.stack})</small>
                </div>
                <a href={post.github} className="btn btn-sm btn-outline-info" target="_blank" rel="noreferrer">
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};