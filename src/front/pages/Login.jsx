import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import isotipo from "../assets/img/isotipo.png";
import bannerImg from "../assets/img/ferenc-almasi-oCm8nPkE40k-unsplash.jpg";

export const Login = () => {
  const { dispatch } = useGlobalReducer();   // Acceso al store global
  const navigate = useNavigate();            // Permite redirigir después de login

  // Estado local para capturar el email y la contraseña del formulario
  const [form, setForm] = useState({ email: "", password: "" });

  // Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Maneja el envío del formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      // Realiza la solicitud POST al backend (ruta de login)
      
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();

        // CAMBIO IMPORTANTE:
        // Guarda el token y los datos del usuario en localStorage para mantener la sesión
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // CAMBIO CLAVE:
        // Guarda el usuario en el store global (para mostrar en navbar, etc.)
        dispatch({ type: "set_user", payload: data.user });

        alert("Login successful!");
        navigate("/profile");    // Redirige al perfil después del login
      } else {
        const error = await res.json();
        alert(error.error || "Invalid email or password.");  // Muestra error del backend
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in.");  // Error genérico si el servidor no responde
    }
  };

  // Renderiza el formulario visual de login
  return (
    <div className="vh-100 vw-100 d-flex overflow-hidden">
      {/* Imagen lateral */}
      <div className="d-none d-md-block w-50">
        <img
          src={bannerImg}
          alt="Login Banner"
          className="img-fluid vh-100"
          style={{ objectFit: "cover", width: "100%" }}
        />
      </div>

      {/* Formulario de login */}
      <div className="w-100 w-md-50 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="p-5" style={{ width: "100%", maxWidth: "400px" }}>
          <div className="text-center mb-4">
            <img src={isotipo} alt="GitWise logo" width="50" />
            <h4 className="mt-3">
              Sign in to <span style={{ color: "#2563eb" }}><strong>GitWise</strong></span>
            </h4>
            <p className="text-secondary">
              Discover inspiring projects and connect with developers like you.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control mb-3 bg-light border-0"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control mb-4 bg-light border-0"
              onChange={handleChange}
              required
            />
            <button type="submit" className="btn btn-primary w-100 mb-3">
              Sign In
            </button>

            {/*<button type="button" className="btn btn-outline-light w-100">
              <i className="fab fa-google me-2"></i> Continue with Google
            </button>*/}
          </form>
        </div>
      </div>
    </div>
  );
};
