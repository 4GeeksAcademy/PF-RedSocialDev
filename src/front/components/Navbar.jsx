// File: src/front/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logocompleto.png";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    actions.logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="GitWise Logo" style={{ height: "40px" }} className="me-2" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
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
          </ul>

          <div className="d-flex align-items-center">
            {!store.user ? (
              <>
                <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            ) : (
              <>
                <span className="text-white me-2">{store.user.username}</span>
                <Link to="/profile">
                  <img
                    src="https://avatars.githubusercontent.com/u/000000?v=4"
                    alt="Avatar"
                    className="rounded-circle me-3"
                    style={{ width: "36px", height: "36px", objectFit: "cover" }}
                  />
                </Link>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
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