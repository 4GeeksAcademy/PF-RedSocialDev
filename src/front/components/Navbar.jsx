// File: src/front/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logocompleto.png";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, actions } = useGlobalReducer();    // Accede al store y las acciones globales
  const navigate = useNavigate();                   // Permite redirigir

  // Función que cierra la sesión
  const handleLogout = () => {
    localStorage.removeItem("token");      // Borra el token del almacenamiento local
    localStorage.removeItem("user");       // Borra los datos de usuario guardados
    actions.logout();                      // Elimina el usuario del store global (acción en el reducer)
    navigate("/");                         // Redirige al Home
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">

        {/* Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="GitWise Logo" style={{ height: "40px" }} className="me-2" />
        </Link>

        {/* Botón hamburguesa responsive */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Enlaces del menú */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            {/* Si no está logueado muestra solo Contact y Donate */}
            {/* La expresión {store.user ? ( ... ) : ( ... )} es un condicional ternario que sirve para mostrar contenido diferente en el JSX*/}
            {!store.user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">Contact</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="https://stripe.com/es">Donate</Link>
                </li>
              </>
            ) : (
              // Si está logueado muestra TODO el menú
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/posts">Projects</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/AI-search">AI Search</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Admin</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">Contact</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Profile</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="https://stripe.com/es">Donate</Link>
                </li>
              </>
            )}

          </ul>

          {/* Parte derecha del navbar */}
          <div className="d-flex align-items-center">

            {/* Si NO hay usuario, muestra login y register */}
            {!store.user ? (
              <>
                <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            ) : (
              <>
                {/* Si el usuario está logueado: muestra su nombre, avatar y botón logout */}
                <span className="text-white me-2">{store.user.username}</span>
                <Link to="/profile">
                  <img
                    src={store.user.avatar_url || "https://avatars.githubusercontent.com/u/000000?v=4"}
                    alt="Avatar"
                    className="rounded-circle me-3"
                    style={{ width: "36px", height: "36px", objectFit: "cover" }}
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm"
                >
                  Logout
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

