
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import useAuthStore from "../store/useAuthStore.js";
import useSessionStore from "../store/useSessionStore.js";
import CharacterPreview from "../components/character/CharacterPreview.jsx";

export default function AvatarSelection() {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);

  const targetCount = useSessionStore((s) => s.avatarCount);
  const sessionAvatars = useSessionStore((s) => s.avatars);
  const sessionAvatarReady = useSessionStore(
    (s) => s.sessionAvatarReady
  );
  const beginAvatarSession = useSessionStore(
    (s) => s.beginAvatarSession
  );

  const [savedAvatars, setSavedAvatars] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSavedAvatars() {
      if (!isAuthenticated || isGuest) {
        setSavedAvatars([]);
        setLoading(false);
        return;
      }

      try {
        const result = await api.get("/users/avatars");
        if (!cancelled) {
          setSavedAvatars((result.avatars || []).slice(0, 5));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load saved avatars.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSavedAvatars();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isGuest]);

  useEffect(() => {
    setSelectedIndexes([]);
  }, []);

  function toggleAvatar(index) {
    setSelectedIndexes((current) => {
      if (current.includes(index)) {
        return current.filter((item) => item !== index);
      }

      if (current.length >= targetCount) return current;

      return [...current, index];
    });
  }

  
  function handleContinue() {
    const ready = sessionAvatarReady || [];
    const completedCount = ready.filter(Boolean).length;

    // All requested avatars are already complete.
    if (completedCount >= targetCount) {
      navigate("/photo-choice");
      return;
    }

    // Keep the existing session avatars and open the first unfinished slot.
    const nextIndex = ready.findIndex((isReady) => !isReady);

    if (nextIndex !== -1) {
      useSessionStore.getState().setActiveAvatar(nextIndex);
      navigate("/avatar-design");
      return;
    }

    // No avatars have been created yet: start from the saved avatars selected.
    const selectedSaved = selectedIndexes
      .map((index) => savedAvatars[index])
      .filter(Boolean);

    beginAvatarSession(selectedSaved, targetCount);
    navigate(
      selectedSaved.length < targetCount
        ? "/avatar-design"
        : "/photo-choice"
    );
  }


  const ready = sessionAvatarReady || [];
  const completedCount = ready.filter(Boolean).length;

  return (
    <main className="page">
      <section className="avatar-selection-page">
        <h1>CHOOSE YOUR AVATARS</h1>

        <p>
          Select up to {targetCount} saved avatars for this session.
          You can create the remaining{" "}
          {Math.max(0, targetCount - selectedIndexes.length)}.
        </p>

        {loading && <p>Loading your saved avatars...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !isAuthenticated && (
          <p>
            Guest mode: you can create avatars for this session,
            but saved avatars are available after logging in.
          </p>
        )}

        <div className="saved-avatar-grid">
          {Array.from({ length: 5 }, (_, index) => {
            const sessionReady = ready[index] === true;
            const sessionAvatar = sessionReady
              ? sessionAvatars[index]
              : null;

            const libraryAvatar =
              isAuthenticated && !isGuest
                ? savedAvatars[index]
                : null;

            const avatar = libraryAvatar;
            const selected = selectedIndexes.includes(index);

            return (
              <button
                key={index}
                type="button"
                className={`saved-avatar-slot${selected ? " selected" : ""}`}
                disabled={
                  !avatar ||
                  loading ||
                  (!selected && selectedIndexes.length >= targetCount)
                }
                onClick={() => toggleAvatar(index)}
                aria-pressed={selected}
              >
                <span>AVATAR {index + 1}</span>

                {avatar ? (
                  <CharacterPreview
                    avatarConfig={avatar}
                    avatarView="full"
                    skinColor={avatar.skinColor}
                    hairColor={avatar.hairColor}
                  />
                ) : (
                  <span className="empty-avatar-slot">
                    {loading ? "Loading..." : "EMPTY SLOT"}
                  </span>
                )}

                {avatar && (
                  <span>{selected ? "✓ SELECTED" : "SELECT"}</span>
                )}
              </button>
            );
          })}
        </div>

        <p>
          Selected: {Math.min(selectedIndexes.length, targetCount)} / {targetCount}
          {" · "}
          Completed: {Math.min(completedCount, targetCount)} / {targetCount}
        </p>

        <div className="avatar-selection-actions">
          <button
            type="button"
            className="avatar-back-button"
            onClick={() => navigate("/strip-count")}
          >
            BACK
          </button>

          <button
            type="button"
            className="setup-confirm"
            disabled={loading || !!error}
            onClick={handleContinue}
          >
            {completedCount >= targetCount
              ? "CONTINUE"
              : "CREATE REMAINING AVATARS"}
          </button>
        </div>
      </section>
    </main>
  );
}
