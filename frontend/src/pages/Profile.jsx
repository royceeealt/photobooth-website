import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
import ProfileAvatar from "../components/ProfileAvatar.jsx";
import {
  getProfileAvatar,
  setProfileAvatar,
} from "../lib/profileAvatar.js";

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [avatarChoice, setAvatarChoice] = useState(() => getProfileAvatar(user));

  function chooseAvatar(avatar) {
    setProfileAvatar(user, avatar);
    setAvatarChoice(avatar);
  }

  return (
    <main className="page profile-page">
      <section className="profile-card">
        <Link className="profile-back-link" to="/strip-count">← Back to Photo Booth</Link>
        <ProfileAvatar user={user} className="profile-card__avatar" />
        <h1>YOUR PROFILE</h1>
        <fieldset className="profile-avatar-options">
          <legend>EDIT PROFILE PICTURE</legend>
          {[
            { id: "male", label: "Current" },
            { id: "female", label: "Female" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              className={avatarChoice === option.id ? "selected" : ""}
              aria-pressed={avatarChoice === option.id}
              onClick={() => chooseAvatar(option.id)}
            >
              <ProfileAvatar user={user} variant={option.id} className="profile-avatar-option__image" />
              <span>{option.label}</span>
            </button>
          ))}
        </fieldset>
        <dl className="profile-details">
          <div>
            <dt>Username</dt>
            <dd>{user?.username || "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email || "—"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
