import { useState } from "react";
import { useNavigate } from "react-router-dom";
import isotipo from "../assets/img/isotipo.png"; // ajusta la ruta si cambia

export const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    stack: "",
    level: ""
  });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!resp.ok) throw new Error("Error en el registro");

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      alert(err.message);
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
      <style>
        {`input::placeholder, select::placeholder { color: #333; opacity: 1; }`}
      </style>
      <div className="card p-5 shadow-lg border-0" style={{ maxWidth: "500px", width: "100%", backgroundColor: "#222" }}>
        <div className="text-center mb-4">
          <img src={isotipo} alt="GitWise Logo" style={{ width: "80px" }} />
          <h2 className="mt-3" style={{ color: "#5d4eff" }}>Crea tu cuenta GitWise</h2>
        </div>
        {success ? (
          <div className="alert alert-success text-center" role="alert">
            Registro exitoso. Redirigiendo...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input className="form-control mb-3" name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} required style={inputStyle} />
            <input className="form-control mb-3" name="last_name" placeholder="Apellido" value={formData.last_name} onChange={handleChange} required style={inputStyle} />
            <input className="form-control mb-3" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required style={inputStyle} />
            <input className="form-control mb-3" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={inputStyle} />
            <input className="form-control mb-3" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={inputStyle} />
            <select className="form-select mb-3" name="stack" value={formData.stack} onChange={handleChange} required style={inputStyle}>
              <option value="">Stack preferido</option>
              <option value="HTML">HTML</option>
              <option value="CSS">CSS</option>
              <option value="JAVASCRIPT">JavaScript</option>
              <option value="PYTHON">Python</option>
              <option value="SQL">SQL</option>
            </select>
            <select className="form-select mb-3" name="level" value={formData.level} onChange={handleChange} required style={inputStyle}>
              <option value="">Nivel</option>
              <option value="STUDENT">Estudiante</option>
              <option value="JUNIOR_DEV">Junior Dev</option>
              <option value="MID_DEV">Mid Dev</option>
              <option value="SENIOR_DEV">Senior Dev</option>
            </select>
            <button className="btn w-100" style={{ backgroundColor: "#5d4eff", color: "white", transition: "background 0.3s ease" }} type="submit">
              Registrarme
            </button>
          </form>
        )}
      </div>
    </div>
  );
};