import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";

export default function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await login(email, password);
      navigate("/strip-count");
    } catch {
      // The auth store already contains the error.
    }
  }

  return (
    <main className="page">
      <section className="account-page">

        {/* Page heading */}
        <div className="account-heading">
          <p className="eyebrow">
            Polaroid Avatar Creator
          </p>

          <h1 className="account-title">
            Account &amp; Avatar
          </h1>

          <p className="account-subtitle">
            Login branch for returning users.
          </p>
        </div>


        {/* Login card */}
        <section className="auth-card">

          <p className="auth-label">
            Login
          </p>

          <h2 className="auth-title">
            Welcome back
          </h2>

          <p className="auth-description">
            Sign in with the same account used for previous avatar sessions.
          </p>


          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>


            {/* Password */}
            <div className="form-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>


            {error && (
              <p className="error">
                {error}
              </p>
            )}


            {/* Bottom row */}
            <div className="auth-footer">

              <p>
                Saved avatars remain attached to your account.
              </p>

              <button
                className="primary-button"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Logging in..." : "Log in →"}
              </button>

            </div>

          </form>

        </section>


        {/* Back to signup */}
        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">
            Sign up
          </Link>
        </p>

      </section>
    </main>
  );
}