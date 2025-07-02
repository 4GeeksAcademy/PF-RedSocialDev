import { useState } from "react";
import isotipo from "../assets/img/isotipo.png";

export const Register = () => {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        stack: "",
        level: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                alert("Cuenta creada exitosamente.");
            } else {
                alert("Error al crear la cuenta.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            className="d-flex align-items-center justify-content-center vh-100"
            style={{ backgroundColor: "#0d0d0d" }}
        >
            <form className="bg-black p-5 rounded shadow" onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                    <img src={isotipo} alt="GitWise logo" width="50" />
                    <h4 className="text-light mt-3">Crea tu cuenta <strong>GitWise</strong></h4>
                </div>

                <input
                    type="text"
                    name="first_name"
                    placeholder="Nombre"
                    className="form-control my-2 bg-light border-0"
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="last_name"
                    placeholder="Apellido"
                    className="form-control my-2 bg-light border-0"
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="form-control my-2 bg-light border-0"
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="form-control my-2 bg-light border-0"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="form-control my-2 bg-light border-0"
                    onChange={handleChange}
                    required
                />

                <select
                    name="stack"
                    className="form-control my-2 bg-light border-0"
                    onChange={handleChange}
                    required
                >
                    <option value="">Stack preferido</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Fullstack</option>
                </select>

                <select
                    name="level"
                    className="form-control my-2 bg-light border-0"
                    onChange={handleChange}
                    required
                >
                    <option value="">Nivel</option>
                    <option value="junior">Junior</option>
                    <option value="semi-senior">Semi-Senior</option>
                    <option value="senior">Senior</option>
                </select>

                <button type="submit" className="btn btn-primary w-100 mt-3">
                    Crear cuenta
                </button>
            </form>
        </div>
    );
};