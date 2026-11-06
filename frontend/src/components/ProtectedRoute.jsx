import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuthStore from "../store/useAuthStore.js";
import ProfileAvatar from "./ProfileAvatar.jsx";

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
  const user = useAuthStore((state) => state.user);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setProfileMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen]);

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
        <div className="profile-menu" ref={profileMenuRef}>
          <button
            type="button"
            className="profile-menu__trigger"
            aria-label="Open profile menu"
            aria-expanded={profileMenuOpen}
            aria-haspopup="menu"
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <ProfileAvatar user={user} className="profile-menu__avatar" />
            <span className="profile-menu__name">{user?.username || "Profile"}</span>
            <span className="profile-menu__chevron" aria-hidden="true">▾</span>
          </button>

          {profileMenuOpen && (
            <div className="profile-menu__dropdown" role="menu">
              <div className="profile-menu__identity">
                <strong>{user?.username || "Your account"}</strong>
                {user?.email && <span>{user.email}</span>}
              </div>
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setProfileMenuOpen(false)}
              >
                View Profile
              </Link>
              <button type="button" role="menuitem" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          )}
        </div>
      )}

      {children ?? <Outlet />}
    </>
  );
}
