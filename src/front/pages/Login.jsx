import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import isotipo from "../assets/img/isotipo.png";

export const Login = () => {
    const { dispatch } = useGlobalReducer();
    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: "set_user", payload: data });
                alert("Sesión iniciada correctamente.");
            } else {
                alert("Email o contraseña incorrectos.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            className="d-flex align-items-center justify-content-center vh-100"
            style={{ backgroundColor: "#0d0d0d" }} // ✅ fondo más oscuro
        >
            <form className="bg-black p-5 rounded shadow" onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                    <img src={isotipo} alt="GitWise logo" width="50" />
                    <h4 className="text-light mt-3">Inicia sesión en <strong>GitWise</strong></h4>
                </div>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="form-control my-3 bg-light border-0"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="form-control my-3 bg-light border-0"
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="btn btn-primary w-100">Ingresar</button>
            </form>
        </div>
    );
};