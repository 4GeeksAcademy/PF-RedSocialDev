import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ProtectedRoute = ({ children }) => {
  const { store } = useGlobalReducer();

  useEffect(() => {
    if (!store.user) {
      alert("Please login to access this page.");
    }
  }, [store.user]);

  if (!store.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
