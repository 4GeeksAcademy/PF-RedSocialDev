// File: src/front/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ProtectedRoute = () => {
  const { store } = useGlobalReducer();

  // Si el usuario no está logueado, redirigir al login
  if (!store.user) {
    alert("Please login to access this page.");
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está logueado, permitir acceso a la ruta protegida
  return <Outlet />;
};