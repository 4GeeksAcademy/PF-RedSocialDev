import { Link } from "react-router-dom";
import logoCompleto from "../assets/img/logocompleto.png";

export const Navbar = () => {
	const purple = "#5d4eff";
	const purpleDark = "#493ccc";

	return (
		<nav className="navbar navbar-dark" style={{ backgroundColor: "#1a1a1a" }}>
			<div className="container d-flex justify-content-between align-items-center">
				<Link to="/" className="navbar-brand">
					<img
						src={logoCompleto}
						alt="GitWise Logo"
						style={{ height: "40px" }}
					/>
				</Link>
				<div className="d-flex gap-3">
					<Link to="/login">
						<button className="btn"
							style={{
								backgroundColor: "#1a1a1a",
								color: purple,
								border: `1px solid ${purple}`,
								transition: "all 0.3s ease"
							}}
							onMouseOver={e => {
								e.target.style.backgroundColor = purple;
								e.target.style.color = "#fff";
							}}
							onMouseOut={e => {
								e.target.style.backgroundColor = "#1a1a1a";
								e.target.style.color = purple;
							}}>
							Login
						</button>
					</Link>
					<Link to="/register">
						<button className="btn"
							style={{
								backgroundColor: purple,
								color: "#fff",
								border: `1px solid ${purple}`,
								transition: "all 0.3s ease"
							}}
							onMouseOver={e => {
								e.target.style.backgroundColor = purpleDark;
							}}
							onMouseOut={e => {
								e.target.style.backgroundColor = purple;
							}}>
							Registro
						</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};