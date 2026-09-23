import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";

export default function Signup() {
  const navigate = useNavigate();

  const signup = useAuthStore((state) => state.signup);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    // Check that both password fields match.
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError("");

    try {
      /*
       * Person A's current auth store expects:
       * signup(username, email, password)
       *
       * For now we pass fullName as the username.
       * We can change this once A confirms the backend contract.
       */
      await signup(fullName, email, password);

      navigate("/strip-count");
    } catch {
      // The auth store already contains the server error.
    }
  }

  return (
    <main className="page">
      <section className="account-page signup-account-page">

        {/* Page heading */}
        <div className="account-heading">
          <p className="eyebrow">
            Polaroid Avatar Creator
          </p>

          <h1 className="account-title">
            Account &amp; Avatar
          </h1>

          <p className="account-subtitle">
            Sign up branch for first-time users.
          </p>
        </div>


        {/* Signup card */}
        <section className="auth-card signup-card">

          <p className="auth-label">
            Sign Up
          </p>

          <h2 className="auth-title">
            Create your account
          </h2>

          <p className="auth-description">
            Capture the essentials now so the avatar step can focus on style
            and customization.
          </p>


          <form onSubmit={handleSubmit}>

            {/* Full name */}
            <div className="form-field">
              <label htmlFor="full-name">
                Full name
              </label>

              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>


            {/* Email */}
            <div className="form-field">
              <label htmlFor="signup-email">
                Email address
              </label>

              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>


            {/* Password row */}
            <div className="password-row">

              <div className="form-field">
                <label htmlFor="signup-password">
                  Password
                </label>

                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>


              <div className="form-field">
                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordError("");
                  }}
                  required
                />
              </div>

            </div>


            {/* Errors */}
            {passwordError && (
              <p className="error">
                {passwordError}
              </p>
            )}

            {error && (
              <p className="error">
                {error}
              </p>
            )}


            {/* Bottom row */}
            <div className="auth-footer">

              <p>
                You can personalize your avatar on the next step.
              </p>

              <button
                className="primary-button"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? "Creating..."
                  : "Create account →"}
              </button>

            </div>

          </form>

        </section>

      </section>
    </main>
  );
}