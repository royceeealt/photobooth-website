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
    <main className="account-screen">
      <section className="account-form-panel">
        <h1 className="account-form-title">
          enter your account
        </h1>

        <form onSubmit={handleSubmit} className="pixel-auth-form">
          <div className="pixel-form-field">
            <label htmlFor="email">email address</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="pixel-form-field">
            <label htmlFor="password">password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

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
            {status === "loading" ? "logging in..." : "LOGIN"}
          </button>
        </form>

        <p className="pixel-auth-switch">
          don't have an account?{" "}
          <Link to="/signup">sign up</Link>
        </p>
      </section>
    </main>
  );
}