import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

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
              SIGN IN
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}