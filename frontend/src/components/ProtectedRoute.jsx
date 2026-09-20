import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";

// Wrap any page element that requires a logged-in user.
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
