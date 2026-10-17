import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";

export default function Home() {
  const navigate = useNavigate();

  const continueAsGuest = useAuthStore(
    (state) => state.continueAsGuest
  );

  function handleContinueAsGuest() {
    continueAsGuest();
    navigate("/strip-count", { replace: true });
  }

  return (
    <main className="home-page">
      <div className="home-frame">
        <div className="home-content">
          <h1 className="home-title">
            WELCOME
          </h1>

          <p className="home-subtitle">
            ready for photos?
          </p>

          <p className="home-description">
            choose how you want to continue
            <br />
            before moving to the next step
          </p>

          <div className="home-buttons">
            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              LOGIN
            </button>

            <button
              type="button"
              onClick={() => navigate("/signup")}
            >
              SIGN UP
            </button>
          </div>
        </div>

        {/* Guest button now scales with the frame */}
        <div className="guest-button-wrapper">
          <button
            className="guest-button"
            type="button"
            onClick={handleContinueAsGuest}
          >
            CONTINUE AS GUEST
          </button>
        </div>
      </div>
    </main>
  );
}