import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuthStore from "../store/useAuthStore.js";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isGuest = useAuthStore(
    (state) => state.isGuest
  );

  const authChecked = useAuthStore(
    (state) => state.authChecked
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  const location = useLocation();
  const navigate = useNavigate();

  if (!authChecked) {
    return null;
  }

  // Permit guests and authenticated users, but not logged-out visitors.
  if (!isAuthenticated && !isGuest) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <>
      {isAuthenticated && (
        <button
          type="button"
          className="primary-button auth-logout-button"
          onClick={handleLogout}
        >
          Log Out
        </button>
      )}

      {children ?? <Outlet />}
    </>
  );
}