import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/img/isotipo.png";

export const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/explorar");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!resp.ok) throw new Error("Credenciales inválidas");

      const data = await resp.json();
      localStorage.setItem("token", data.token);
      if (data.username) localStorage.setItem("username", data.username);
      navigate("/explorar");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container-fluid py-5 d-flex justify-content-center align-items-center min-vh-100" style={{
      background: "linear-gradient(135deg, #4A3AFF 0%, #A786FF 100%)"
    }}>
      <div className="card p-5 shadow-lg" style={{ maxWidth: "500px", width: "100%", border: "none" }}>
        <div className="text-center mb-4">
          <img src={logo} alt="GitWise Logo" style={{ width: "80px" }} />
          <h2 className="mt-3" style={{ color: "#4A3AFF" }}>Inicia sesión en GitWise</h2>
        </div>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3" type="email" name="email" placeholder="Email" value={credentials.email} onChange={handleChange} required />
          <input className="form-control mb-3" type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required />
          <button className="btn w-100" style={{ backgroundColor: "#4A3AFF", color: "white", transition: "0.3s", boxShadow: "0 4px 12px rgba(74,58,255,0.3)" }}
            onMouseOver={e => e.currentTarget.style.boxShadow = "0 6px 18px rgba(74,58,255,0.4)"}
            onMouseOut={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,58,255,0.3)"}
            type="submit">
            Iniciar Sesión
          </button>
        </form>
        <p className="text-center mt-3">
          ¿No tienes cuenta? <Link to="/register" style={{ color: "#4A3AFF", fontWeight: "bold" }}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
};