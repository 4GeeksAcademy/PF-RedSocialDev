import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ stack: "", level: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;
  const navigate = useNavigate();

  useEffect(() => {
    setPosts([
      { id: 1, title: "Portfolio Web", description: "Sitio personal con HTML y CSS", stack: "HTML", level: "STUDENT", github: "https://github.com/user1/project1" },
      { id: 2, title: "ToDo App", description: "App con JavaScript Vanilla", stack: "JavaScript", level: "JUNIOR_DEV", github: "https://github.com/user2/project2" },
      { id: 3, title: "Blog Personal", description: "Blog hecho con React", stack: "React", level: "MID_DEV", github: "https://github.com/user3/project3" },
      { id: 4, title: "API REST", description: "API REST en Flask", stack: "Python", level: "SENIOR_DEV", github: "https://github.com/user4/project4" },
      { id: 5, title: "Base de datos", description: "Diseño SQL para e-commerce", stack: "SQL", level: "MID_DEV", github: "https://github.com/user5/project5" },
      { id: 6, title: "Clon de Google", description: "Interfaz clon con HTML/CSS", stack: "HTML", level: "STUDENT", github: "https://github.com/user6/project6" },
      { id: 7, title: "Notas App", description: "Aplicación CRUD con React", stack: "React", level: "JUNIOR_DEV", github: "https://github.com/user7/project7" },
      { id: 8, title: "Tienda Online", description: "Frontend tienda con JavaScript", stack: "JavaScript", level: "MID_DEV", github: "https://github.com/user8/project8" },
      { id: 9, title: "Login System", description: "Sistema login en Python", stack: "Python", level: "JUNIOR_DEV", github: "https://github.com/user9/project9" },
      { id: 10, title: "Dashboard Admin", description: "Panel admin con React", stack: "React", level: "SENIOR_DEV", github: "https://github.com/user10/project10" },
      { id: 11, title: "Blog SQL", description: "Gestor blog con MySQL", stack: "SQL", level: "MID_DEV", github: "https://github.com/user11/project11" },
      { id: 12, title: "Landing Page", description: "Landing moderna HTML/CSS", stack: "HTML", level: "STUDENT", github: "https://github.com/user12/project12" },
      { id: 13, title: "App Finanzas", description: "Control de gastos JS", stack: "JavaScript", level: "MID_DEV", github: "https://github.com/user13/project13" },
      { id: 14, title: "GitHub Finder", description: "Buscador usuarios GitHub en React", stack: "React", level: "JUNIOR_DEV", github: "https://github.com/user14/project14" },
      { id: 15, title: "Analizador de datos", description: "Análisis en Python", stack: "Python", level: "SENIOR_DEV", github: "https://github.com/user15/project15" },
      { id: 16, title: "Sistema de reservas", description: "Reservas SQL", stack: "SQL", level: "MID_DEV", github: "https://github.com/user16/project16" },
      { id: 17, title: "Formulario interactivo", description: "Formulario validado HTML/JS", stack: "JavaScript", level: "STUDENT", github: "https://github.com/user17/project17" },
      { id: 18, title: "Red social", description: "App social con React", stack: "React", level: "SENIOR_DEV", github: "https://github.com/user18/project18" },
      { id: 19, title: "Scraper Python", description: "Scraper web en Python", stack: "Python", level: "MID_DEV", github: "https://github.com/user19/project19" },
      { id: 20, title: "Gestor inventario", description: "CRUD SQL", stack: "SQL", level: "JUNIOR_DEV", github: "https://github.com/user20/project20" }
    ]);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    setCurrentPage(1);
  };

  const filteredPosts = posts.filter(post => {
    return (
      (filter.stack === "" || post.stack === filter.stack) &&
      (filter.level === "" || post.level === filter.level)
    );
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-light">Proyectos Publicados</h2>
          {isLoggedIn && (
            <button className="btn" style={{ backgroundColor: "#5d4eff", color: "white" }} onClick={() => navigate("/create-post")}>Nuevo Post</button>
          )}
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <select className="form-select" name="stack" onChange={handleFilterChange} style={{ backgroundColor: "#111", color: "#5d4eff", borderColor: "#444" }}>
              <option value="">Todos los Stacks</option>
              <option value="HTML">HTML</option>
              <option value="CSS">CSS</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Python">Python</option>
              <option value="SQL">SQL</option>
            </select>
          </div>
          <div className="col-md-6">
            <select className="form-select" name="level" onChange={handleFilterChange} style={{ backgroundColor: "#111", color: "#5d4eff", borderColor: "#444" }}>
              <option value="">Todos los Niveles</option>
              <option value="STUDENT">Estudiante</option>
              <option value="JUNIOR_DEV">Junior Dev</option>
              <option value="MID_DEV">Mid Dev</option>
              <option value="SENIOR_DEV">Senior Dev</option>
            </select>
          </div>
        </div>

        <div className="row">
          {currentPosts.map(post => (
            <div key={post.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow h-100" style={{ backgroundColor: "#222", color: "white" }}>
                <div className="card-body">
                  <h5 className="card-title" style={{ color: "#5d4eff" }}>{post.title}</h5>
                  <p className="card-text text-light">{post.description}</p>
                  <div className="mb-2">
                    <span className="badge bg-secondary me-2">{post.stack}</span>
                    <span className="badge bg-info text-dark">{post.level}</span>
                  </div>
                  <a href={post.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: "#5d4eff", color: "white" }}>Ver GitHub</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              {[...Array(totalPages).keys()].map(num => (
                <li key={num + 1} className={`page-item ${currentPage === num + 1 ? "active" : ""}`}>
                  <button className="page-link" style={{ backgroundColor: currentPage === num + 1 ? "#5d4eff" : "#111", color: "white" }} onClick={() => setCurrentPage(num + 1)}>{num + 1}</button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};