import React from "react";
import { Link, Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If the user is already logged in,
  // skip the login/signup screen.
  if (isAuthenticated) {
    return <Navigate to="/strip-count" replace />;
  }

  return (
    <main className="page">
      <section className="home-page">

        {/* Page heading */}
        <p className="eyebrow">
          Polaroid Avatar Creator
        </p>

        <h1 className="home-title">
          Account &amp; Avatar
        </h1>

        <p className="home-subtitle">
          Choose how you want to continue before moving into avatar setup.
        </p>


        {/* Login / Signup section */}
        <section className="entry-card">

          <div className="entry-header">
            <p className="entry-label">
              Entry Point
            </p>

            <h2 className="entry-title">
              Continue with an existing account or create a new one.
            </h2>

            <p className="entry-description">
              This keeps the account path visible while the avatar path is
              prepared on the next screens.
            </p>
          </div>


          <div className="entry-options">

            {/* Login */}
            <article className="option-card">
              <p className="option-label">
                Login
              </p>

              <h3 className="option-title">
                Use your existing Polaroid Avatar account.
              </h3>

              <p className="option-description">
                Faster return path for users who already have saved avatars
                and preferences.
              </p>

              <Link
                className="primary-button"
                to="/login"
              >
                Login →
              </Link>
            </article>


            {/* Signup */}
            <article className="option-card">
              <p className="option-label">
                Sign Up
              </p>

              <h3 className="option-title">
                Create a new account.
              </h3>

              <p className="option-description">
                Create an account to save this avatar run and future edits.
              </p>

              <Link
                className="primary-button"
                to="/signup"
              >
                Sign up →
              </Link>
            </article>

          </div>
        </section>

      </section>
    </main>
  );
}