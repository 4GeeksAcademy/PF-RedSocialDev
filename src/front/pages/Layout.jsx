// File: src/front/pages/Layout.jsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Layout = () => {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    const checkTokenAndFetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // No hay token, no hacer nada

      try {
        const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/profile", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (res.ok) {
          const data = await res.json();
          dispatch({ type: "set_user", payload: data });
        } else {
          // Token inválido: eliminarlo
          localStorage.removeItem("token");
          dispatch({ type: "logout" });
        }
      } catch (err) {
        console.error("Error validating token:", err);
        localStorage.removeItem("token");
        dispatch({ type: "logout" });
      }
    };

    checkTokenAndFetchUser();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollToTop>
        <Navbar />
        <main className="flex-grow-1">
          <Outlet />
        </main>
        <Footer />
      </ScrollToTop>
    </div>
  );
};