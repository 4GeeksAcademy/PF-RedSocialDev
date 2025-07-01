import { useState } from "react";
import { useNavigate } from "react-router-dom";
import isotipo from "../assets/img/isotipo.png"; // asegúrate de la ruta

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) throw new Error("Credenciales inválidas");
      const data = await resp.json();
      localStorage.setItem("token", data.access_token);
      navigate("/posts");
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    backgroundColor: "#bfbfff",
    color: "#111",
    borderColor: "#999",
    transition: "all 0.3s ease"
  };

  return (
    <div className="container-fluid py-5 d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#1a1a1a" }}>
      <style>{`input::placeholder { color: #333; opacity: 1; }`}</style>
      <div className="card p-5 shadow-lg border-0" style={{ maxWidth: "500px", width: "100%", backgroundColor: "#222" }}>
        <div className="text-center mb-4">
          <img src={isotipo} alt="GitWise Logo" style={{ width: "80px" }} />
          <h2 className="mt-3" style={{ color: "#5d4eff" }}>Inicia sesión en GitWise</h2>
        </div>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input className="form-control mb-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button className="btn w-100" style={{ backgroundColor: "#5d4eff", color: "white", transition: "background 0.3s" }} type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
};