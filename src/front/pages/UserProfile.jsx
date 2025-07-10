import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    if (!store.user) {
      navigate("/login");
      return;
    }

    const mockUser = {
      username: id || "albertdcm",
      email: "albert@example.com",
      tech_stack: "React, Python, SQL",
      level: "MID_DEV",
      github: "https://github.com/albertdcm",
      linkedin: "https://linkedin.com/in/albertdcm",
      portfolio: "https://albertdev.com",
      join_date: "2024-12-03",
      bio: "Full-stack developer passionate about open source and building impactful solutions."
    };

    const mockFavorites = [
      { id: 1, title: "React Portfolio", stack: "React", github: "https://github.com/example/react-portfolio" },
      { id: 2, title: "API REST", stack: "Python", github: "https://github.com/example/api-rest" }
    ];

    const mockMyPosts = [
      { id: 3, title: "Chat App", stack: "JavaScript", github: "https://github.com/example/chat-app" },
      { id: 4, title: "Landing Page", stack: "HTML", github: "https://github.com/example/landing-page" }
    ];

    setUser(mockUser);
    setFavorites(mockFavorites);
    setMyPosts(mockMyPosts);
  }, [id, store.user]);

  if (!user) return <p className="text-white p-5">Loading profile...</p>;

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
          <h3 className="card-title">{user.username}</h3>
          <p className="text-muted fst-italic">{user.bio}</p>

          <div className="d-flex justify-content-center flex-wrap gap-2 my-3">
            {user.tech_stack.split(",").map(skill => (
              <span key={skill} className="badge bg-primary">{skill.trim()}</span>
            ))}
          </div>

          <p className="mb-1"><strong>Level:</strong> {user.level}</p>
          <p className="mb-1"><strong>Email:</strong> {user.email}</p>
          <p className="mb-2 text-secondary">Member since: Dec 2024</p>

          <div className="mt-3 d-flex justify-content-center gap-3">
            <a href={user.github} target="_blank" rel="noreferrer">
              <i className="fab fa-github fa-lg text-white"></i>
            </a>
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin fa-lg text-white"></i>
              </a>
            )}
            {user.portfolio && (
              <a href={user.portfolio} target="_blank" rel="noreferrer">
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