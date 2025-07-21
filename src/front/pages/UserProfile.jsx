// File: src/front/pages/UserProfile.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [currentFavPage, setCurrentFavPage] = useState(1);
  const favoritesPerPage = 5;

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${id}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser({
          username: data.username,
          email: data.email,
          tech_stack: data.stack || "React, Python, SQL",
          level: data.level,
          github: "https://github.com/albertdcm",
          linkedin: "https://linkedin.com/in/albertdcm",
          portfolio: "https://albertdev.com",
          join_date: data.member_since,
          bio: "Full-stack developer passionate about open source and building impactful solutions."
        });
      } catch (err) {
        console.error("User profile fallback to mock:", err);
        setUser({
          username: id,
          email: "albert@example.com",
          tech_stack: "React, Python, SQL",
          level: "MID_DEV",
          github: "https://github.com/albertdcm",
          linkedin: "https://linkedin.com/in/albertdcm",
          portfolio: "https://albertdev.com",
          join_date: "2024-12-03",
          bio: "Full-stack developer passionate about open source and building impactful solutions."
        });
      }
    };

    const fetchPosts = async () => {
      try {
        const resFav = await fetch(`${API_URL}/api/users/${id}/favorites`);
        const resPosts = await fetch(`${API_URL}/api/users/${id}/posts`);
        const favoritesData = resFav.ok ? await resFav.json() : [];
        const postsData = resPosts.ok ? await resPosts.json() : [];

        setFavorites(favoritesData);
        setMyPosts(postsData);
      } catch (err) {
        console.error("MyPosts fallback to mock:", err);
        const mockFavorites = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          title: `Favorite Project ${i + 1}`,
          stack: "React",
          github: "https://github.com/example/react-portfolio"
        }));

        const mockMyPosts = Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          title: `Project ${i + 1}`,
          description: "Sample project description.",
          stack: "JavaScript",
          github: "https://github.com/example/project"
        }));

        setFavorites(mockFavorites);
        setMyPosts(mockMyPosts);
      }
    };

    fetchProfile();
    fetchPosts();
  }, [id]);

  const handleDelete = async (postId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setMyPosts(myPosts.filter(post => post.id !== postId));
      Swal.fire("Deleted!", "Your post has been deleted.", "success");
    }
  };

  const handleEdit = async (post) => {
    const { value: values, dismiss } = await Swal.fire({
      title: 'Edit Post',
      html:
        `<input id="title" class="swal2-input" placeholder="Title" value="${post.title}">` +
        `<textarea id="desc" class="swal2-textarea" placeholder="Description">${post.description}</textarea>` +
        `<input id="url" class="swal2-input" placeholder="GitHub URL" value="${post.github}">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          title: document.getElementById('title').value,
          description: document.getElementById('desc').value,
          github: document.getElementById('url').value
        };
      }
    });

    if (dismiss === Swal.DismissReason.cancel) return;

    if (values) {
      const updatedPosts = myPosts.map(p => p.id === post.id ? { ...p, ...values } : p);
      setMyPosts(updatedPosts);
      Swal.fire("Updated!", "Post updated successfully.", "success");
    }
  };

  const favStart = (currentFavPage - 1) * favoritesPerPage;
  const favEnd = favStart + favoritesPerPage;
  const paginatedFavorites = favorites.slice(favStart, favEnd);
  const totalPages = Math.ceil(favorites.length / favoritesPerPage);

  if (!user) return <p className="text-white p-5">Loading profile...</p>;

  return (
    <div className="bg-black text-white min-vh-100 p-3">
      <div className="card bg-dark text-white shadow-lg">
        <div className="position-relative">
          <img src="https://images.unsplash.com/photo-1503264116251-35a269479413" alt="Banner" className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
          <img src="https://avatars.githubusercontent.com/u/000000?v=4" alt="Avatar" className="rounded-circle border border-3 border-white position-absolute" style={{ width: "120px", height: "120px", left: "50%", transform: "translateX(-50%)", bottom: "-60px" }} />
        </div>
        <div className="card-body text-center mt-5 pt-4">
          <h3 className="card-title fw-bold text-white">{user.username}</h3>
          <p className="text-white fst-italic">{user.bio}</p>
          <div className="d-flex justify-content-center flex-wrap gap-2 my-3">
            {user.tech_stack.split(",").map(skill => (<span key={skill} className="badge" style={{ backgroundColor: "#7b5bff" }}>{skill.trim()}</span>))}
          </div>
          <p><strong>Level:</strong> <span className="text-white">{user.level}</span></p>
          <p><strong>Email:</strong> <span className="text-white">{user.email}</span></p>
          <p><strong>Member since:</strong> <span className="text-white">{user.join_date}</span></p>
          <div className="mt-3 d-flex justify-content-center gap-3">
            <a href={user.github} target="_blank" rel="noreferrer"><i className="fab fa-github fa-lg text-white"></i></a>
            {user.linkedin && <a href={user.linkedin} target="_blank" rel="noreferrer"><i className="fab fa-linkedin fa-lg text-white"></i></a>}
            {user.portfolio && <a href={user.portfolio} target="_blank" rel="noreferrer"><i className="fas fa-globe fa-lg text-white"></i></a>}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="fw-bold text-white">My Posts</h4>
        <div className="position-relative">
          <Carousel
            responsive={{
              desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },
              tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
              mobile: { breakpoint: { max: 464, min: 0 }, items: 1 }
            }}
            arrows
            containerClass="pb-5"
            keyBoardControl
            itemClass="p-2"
          >
            {myPosts.map(post => (
              <div className="card bg-dark text-white h-100" key={post.id}>
                <div className="card-body">
                  <h5 className="card-title fw-bold">{post.title}</h5>
                  <p className="card-text text-light small">{post.description}</p>
                  <p className="text-info small mb-2">{post.stack}</p>
                  <a href={post.github} target="_blank" rel="noreferrer" className="btn btn-sm btn-gitwise me-2">View</a>
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(post)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(post.id)}>Delete</button>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="fw-bold text-white">My Favorites</h4>
        {paginatedFavorites.length === 0 ? (<p>No favorites yet.</p>) : (
          <ul className="list-group list-group-flush">
            {paginatedFavorites.map(post => (
              <li key={post.id} className="list-group-item bg-black text-white d-flex justify-content-between align-items-center">
                <div><strong>{post.title}</strong> <small className="text-muted">({post.stack})</small></div>
                <a href={post.github} className="btn btn-sm btn-gitwise" target="_blank" rel="noreferrer">View</a>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 d-flex justify-content-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${currentFavPage === i + 1 ? 'btn-gitwise' : 'btn-outline-light'}`}
              onClick={() => setCurrentFavPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};