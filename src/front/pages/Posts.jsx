// src/front/pages/Posts.jsx
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
      { id: 1, title: "Portfolio React", description: "App de portafolio con React y Bootstrap", stack: "React", level: "JUNIOR_DEV", github: "https://github.com/example/1" },
      { id: 2, title: "Clima Flask API", description: "REST API de clima con Flask", stack: "Python", level: "MID_DEV", github: "https://github.com/example/2" },
      { id: 3, title: "SQL Reports", description: "Informes con SQL avanzado", stack: "SQL", level: "SENIOR_DEV", github: "https://github.com/example/3" },
      { id: 4, title: "Landing Page HTML", description: "Landing estática con HTML y CSS", stack: "HTML", level: "STUDENT", github: "https://github.com/example/4" },
      { id: 5, title: "ToDo App JS", description: "Lista de tareas interactiva", stack: "JavaScript", level: "JUNIOR_DEV", github: "https://github.com/example/5" },
      { id: 6, title: "Blog Flask", description: "Blog minimalista hecho en Python", stack: "Python", level: "JUNIOR_DEV", github: "https://github.com/example/6" },
      { id: 7, title: "E-commerce React", description: "Frontend de tienda online", stack: "React", level: "MID_DEV", github: "https://github.com/example/7" },
      { id: 8, title: "Autenticación JS", description: "Sistema login con localStorage", stack: "JavaScript", level: "MID_DEV", github: "https://github.com/example/8" },
      { id: 9, title: "Formulario CSS", description: "Diseño responsivo de formularios", stack: "CSS", level: "STUDENT", github: "https://github.com/example/9" },
      { id: 10, title: "Blog JAMStack", description: "Next.js blog with Markdown", stack: "JavaScript", level: "MID_DEV", github: "https://github.com/example/10" },
      { id: 11, title: "Dashboard SQL", description: "Dashboard de KPIs usando SQL", stack: "SQL", level: "SENIOR_DEV", github: "https://github.com/example/11" },
      { id: 12, title: "Chat App", description: "Chat en tiempo real con React y Firebase", stack: "React", level: "SENIOR_DEV", github: "https://github.com/example/12" },
      { id: 13, title: "CRUD Flask", description: "CRUD básico en Python Flask", stack: "Python", level: "JUNIOR_DEV", github: "https://github.com/example/13" },
      { id: 14, title: "Login UI", description: "Interfaz de login mobile-first", stack: "CSS", level: "JUNIOR_DEV", github: "https://github.com/example/14" },
      { id: 15, title: "Weather App", description: "Consumo API clima con JS", stack: "JavaScript", level: "MID_DEV", github: "https://github.com/example/15" },
      { id: 16, title: "Admin Panel", description: "Panel admin con roles y permisos", stack: "React", level: "SENIOR_DEV", github: "https://github.com/example/16" },
      { id: 17, title: "CSV Parser", description: "Carga y lectura CSV en Python", stack: "Python", level: "MID_DEV", github: "https://github.com/example/17" },
      { id: 18, title: "Portfolio HTML", description: "Portafolio personal sin JS", stack: "HTML", level: "STUDENT", github: "https://github.com/example/18" },
      { id: 19, title: "SQL Dashboard", description: "Dashboard consultas dinámicas", stack: "SQL", level: "MID_DEV", github: "https://github.com/example/19" },
      { id: 20, title: "GitHub Finder", description: "Búsqueda de usuarios GitHub", stack: "JavaScript", level: "MID_DEV", github: "https://github.com/example/20" }
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
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">Proyectos Publicados</h2>
        {isLoggedIn && (
          <button className="btn btn-outline-primary" onClick={() => navigate("/create-post")}>Nuevo Post</button>
        )}
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <select className="form-select" name="stack" onChange={handleFilterChange}>
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
          <select className="form-select" name="level" onChange={handleFilterChange}>
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
            <div className="card shadow h-100">
              <div className="card-body">
                <h5 className="card-title text-dark fw-semibold">{post.title}</h5>
                <p className="card-text">{post.description}</p>
                <div className="mb-2">
                  <span className="badge bg-secondary me-2">{post.stack}</span>
                  <span className="badge bg-info text-dark">{post.level}</span>
                </div>
                <a href={post.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">Ver GitHub</a>
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
                <button className="page-link" onClick={() => setCurrentPage(num + 1)}>{num + 1}</button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};