import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FavoriteButton } from "../components/FavoriteButton";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import SmartSearch from "../components/SmartSearch";
import { FaRegComment } from "react-icons/fa"; // Icono de burbuja de comentario
import { CommentSection } from "../components/CommentSection"; // Componente de comentarios

const STACKS = ["React", "Vue", "Angular", "MERN", "Next.js", "Svelte"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    github: "",
    stack: "",
    level: ""
  });

  const { store } = useGlobalReducer();
  const postsPerPage = 6;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  if (!store.token) return <Navigate to="/login" replace />;

  // Obtener los posts desde la API al montar el componente
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/posts`);
        const data = await res.json();
        if (res.ok && data.success) {
          setPosts(data.posts);
        } else {
          toast.error(data.msg || "Error fetching posts");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch posts");
      }
    };
    fetchPosts();
  }, [BASE_URL]);

  // Filtrado de posts según búsqueda y filtros
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStack = stackFilter ? post.stack === stackFilter : true;
    const matchesLevel = levelFilter ? post.level === levelFilter : true;
    return matchesSearch && matchesStack && matchesLevel;
  });

  // Paginación
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // ➕ Crear nuevo proyecto
  const handleCreateProject = async () => {
    if (!store.user || !store.token) return toast.error("Please login to create a project");
    const { title, description, github, stack, level } = newProject;
    if (!title || !description || !github) return toast.error("All fields required");

    try {
      const res = await fetch(`${BASE_URL}/api/user/post/${store.user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({
          title,
          description,
          repo_URL: github,
          image_URL: "https://via.placeholder.com/300",
          stack,
          level,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "Failed to save project");
      setPosts(prev => [data.post, ...prev]);
      toast.success("Project created!");
      setShowModal(false);
      setNewProject({ title: "", description: "", github: "", stack: "", level: "" });
    } catch (err) {
      console.error("POST error:", err);
      toast.error("Failed to save project: " + err.message);
    }
  };

  return (
    <div className="container-fluid hero-bg min-vh-100 py-5 px-3 d-flex flex-column align-items-center">
      <div className="w-100 w-md-75 w-lg-50 text-center">
        <h2 className="hero-title mb-3">AI Search & Explore</h2>
        <p className="hero-subtitle mb-4">
          Discover, manually or through our AI, and contribute open-source projects. Find ideas,
          publish your work or inspiration, and connect with fellow developers.
        </p>
        <button className="btn cta-btn my-3" onClick={() => setShowModal(true)}>+ Create New Project</button>

        {/* Modal de nuevo proyecto */}
        {showModal && (
          <div className="modal d-block bg-dark bg-opacity-75">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark text-white p-4 rounded">
                <h5 className="mb-3">New Project</h5>
                <input type="text" className="form-control mb-2" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                <textarea className="form-control mb-2" placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}></textarea>
                <input type="text" className="form-control mb-2" placeholder="GitHub Repo URL" value={newProject.github} onChange={e => setNewProject({ ...newProject, github: e.target.value })} />
                <select className="form-select mb-2" value={newProject.stack} onChange={e => setNewProject({ ...newProject, stack: e.target.value })}>
                  <option value="">Select Stack</option>
                  {STACKS.map((stack, i) => <option key={i} value={stack}>{stack}</option>)}
                </select>
                <select className="form-select mb-3" value={newProject.level} onChange={e => setNewProject({ ...newProject, level: e.target.value })}>
                  <option value="">Select Level</option>
                  {LEVELS.map((level, i) => <option key={i} value={level}>{level}</option>)}
                </select>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-gitwise" onClick={handleCreateProject}>Save Project</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <SmartSearch />

        {/* Filtros */}
        <div className="d-flex gap-3 justify-content-center mb-4">
          <select className="form-select bg-dark text-white border-secondary" style={{ maxWidth: "180px" }} value={stackFilter} onChange={(e) => setStackFilter(e.target.value)}>
            <option value="">All Stacks</option>
            {[...new Set(posts.map(p => p.stack).filter(Boolean))].map((stack, i) => <option key={`stack-filter-${i}`} value={stack}>{stack}</option>)}
          </select>

          <select className="form-select bg-dark text-white border-secondary" style={{ maxWidth: "180px" }} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="">All Levels</option>
            {[...new Set(posts.map(p => p.level).filter(Boolean))].map((level, i) => <option key={`level-filter-${i}`} value={level}>{level}</option>)}
          </select>
        </div>

        {/* Tarjetas */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 w-100 px-md-5">
          {currentPosts.map(post => (
            <motion.div key={post.id} className="col" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="position-relative">
                <div className="icon-box d-flex flex-column justify-content-between">
                  <h5 style={{ color: "#fff" }}>{post.title}</h5>
                  <p>{post.description}</p>
                  {post.stack && <span className="badge bg-secondary me-2">{post.stack}</span>}
                  {post.level && <span className="badge bg-info">{post.level}</span>}

                  {/* Botones de acción */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <a href={post.repo_URL} target="_blank" rel="noreferrer" className="btn btn-gitwise btn-sm">GitHub</a>
                    <div className="d-flex align-items-center gap-2">
                      <FavoriteButton postId={post.id} count={post.favorite_count || 0} whiteText />
                      <button
                        className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "32px" }}
                        onClick={() =>
                          setOpenCommentPostId((prev) => (prev === post.id ? null : post.id))
                        }
                      >
                        <FaRegComment />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Caja de comentarios individual */}
                {openCommentPostId === post.id && (
                  <div className="mt-3 w-100">
                    <CommentSection postId={post.id} visible={true} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Paginación */}
        <div className="d-flex justify-content-center mt-5 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} className={`btn btn-sm ${page === currentPage ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setCurrentPage(page)}>
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
