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
    <main className="account-screen">
      <section className="account-form-panel signup-form-panel">
        <h1 className="account-form-title">
          create your account
        </h1>

        <form onSubmit={handleSubmit} className="pixel-auth-form">
          <div className="pixel-form-field">
            <label htmlFor="full-name">full name</label>

            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>

          <div className="pixel-form-field">
            <label htmlFor="signup-email">email address</label>

            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="signup-password-row">
            <div className="pixel-form-field">
              <label htmlFor="signup-password">password</label>

              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="pixel-form-field">
              <label htmlFor="confirm-password">
                confirm password
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

          {passwordError && (
            <p className="pixel-auth-error">
              {passwordError}
            </p>
          )}

          {error && (
            <p className="pixel-auth-error">
              {error}
            </p>
          )}

          <button
            className="pixel-auth-button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "creating..." : "CONFIRM"}
          </button>
        </form>
      </section>
    </main>
  );
}