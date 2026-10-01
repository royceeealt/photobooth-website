import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSessionStore from "../store/useSessionStore.js";

export default function StripCount() {
  const navigate = useNavigate();
  const setAvatarCount = useSessionStore((s) => s.setAvatarCount);
  const setStripCount = useSessionStore((s) => s.setStripCount);

  const [avatarCount, setAvatarCountLocal] = useState("");
  const [layoutSize, setLayoutSize] = useState("");

  function handleContinue(event) {
  event.preventDefault();

  if (!avatarCount || !layoutSize) {
    return;
  }

  setAvatarCount(Number(avatarCount));
  setStripCount(Number(layoutSize));

  navigate("/avatar-design");
}

  return (
    <main className="page">
      <section className="setup-page">

        {/* Question 1 */}
        <div className="setup-field">
          <label htmlFor="avatar-count">
            How many avatars are you creating?
          </label>

          <select
            id="avatar-count"
            value={avatarCount}
            onChange={(event) => setAvatarCountLocal(event.target.value)}
          >
            <option value="">Select</option>
            <option value="1">1 avatar</option>
            <option value="2">2 avatars</option>
            <option value="3">3 avatars</option>
            <option value="4">4 avatars</option>
          </select>
        </div>


        {/* Question 2 */}
        <div className="setup-field">
          <label htmlFor="layout-size">
            What is the size of the layout?
          </label>

          <select
            id="layout-size"
            value={layoutSize}
            onChange={(event) => setLayoutSize(event.target.value)}
          >
            <option value="">Select</option>
            <option value="1">1 photo</option>
            <option value="2">2 photos</option>
            <option value="3">3 photos</option>
            <option value="4">4 photos</option>
          </select>
        </div>


        {/* Continue */}
        <button
          className="setup-confirm"
          type="button"
          onClick={handleContinue}
          disabled={!avatarCount || !layoutSize}
        >
          Confirm →
        </button>

      </section>
    </main>
  );
}