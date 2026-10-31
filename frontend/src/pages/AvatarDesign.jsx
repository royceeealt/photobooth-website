import React, { useState } from "react";

import { api } from "../lib/api.js";
import useAuthStore from "../store/useAuthStore.js";

import { useNavigate } from "react-router-dom";

import ItemPicker from "../components/ItemPicker.jsx";
import ColorPicker from "../components/character/ColorPicker.jsx";
import CharacterDraw from "../components/character/CharacterDraw.jsx";

import useSessionStore from "../store/useSessionStore.js";

import CharacterPreview from "../components/character/CharacterPreview.jsx";


const categories = [
  { id: "skinTone", label: "Skin Tone" },
  { id: "eyes", label: "Eyes" },
  { id: "lips", label: "Lips" },
  { id: "hair", label: "Hair" },
  { id: "top", label: "Top" },          // Must be "top" (matches MongoDB)
  { id: "bottom", label: "Bottom" },    // Must be "bottom" (matches MongoDB)
  { id: "footwear", label: "Shoes" },
  { id: "accessories", label: "Accessories" }, // Must be "accessories" (plural, matches MongoDB)
];

// Numeric item ids used by Randomize. These come from the asset filenames
// (hair_01 -> 1, top_03 -> 3 ...). null means "nothing selected".
const RANDOM_POOLS = {
  hair: [1, 2, 3, 4, 5, 6, 7],
  eyes: [1, 2],
  top: [1, 2, 3, 4, 5, 6, 7],
  bottom: [1, 2, 3, 4, 5, 6],
  footwear: [1, 2],
};

const RANDOM_COLORS = {
  skinColor: [
    "#F1C6A5",
    "#D99A78",
    "#B97856",
    "#8D5A3B",
  ],

  hairColor: [
    "#222222",
    "#5B321F",
    "#8B5A2B",
    "#D4A72C",
  ],

  eyesColor: [
    "#222222",
    "#4A2F24",
    "#3B6E8C",
    "#4F7A3A",
  ],

  topColor: [
    "#B0B0B0",
    "#6B7280",
    "#4F46E5",
    "#D97706",
    "#E879A5",
    "#FFFFFF",
  ],

  bottomColor: [
    "#B0B0B0",
    "#4B5563",
    "#2563EB",
    "#7C3AED",
    "#222222",
  ],

  footwearColor: [
    "#222222",
    "#6B7280",
    "#2563EB",
    "#DC2626",
    "#FFFFFF",
  ],

  accessoryColor: [
    "#222222",
    "#7B3F22",
    "#2563EB",
    "#DC2626",
    "#D4A72C",
  ],

  lipsColor: [
    "#B05A78",
    "#C96B7B",
    "#A83250",
    "#8B3A62",
    "#D98282",
    "#E6A0A0",
  ],
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function AvatarDesign() {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);

  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [savedAvatars, setSavedAvatars] = useState([]);
  const [selectedReplaceIndex, setSelectedReplaceIndex] = useState(null);

  const avatarConfig = useSessionStore((s) => s.avatarConfig);
  const setAvatarItem = useSessionStore((s) => s.setAvatarItem);
  const setAvatarColor = useSessionStore((s) => s.setAvatarColor);
  const updateAccessorySlot = useSessionStore(
    (s) => s.setAccessorySlot
  );
  const setAvatarDrawing = useSessionStore(
    (s) => s.setAvatarDrawing
  );
  const avatarView = useSessionStore((s) => s.avatarView);
  const setAvatarView = useSessionStore((s) => s.setAvatarView);
  const resetAvatar = useSessionStore((s) => s.resetAvatar);
    const avatarCount = useSessionStore((s) => s.avatarCount);
  const activeAvatarIndex = useSessionStore((s) => s.activeAvatarIndex);
  const saveCurrentAvatar = useSessionStore((s) => s.saveCurrentAvatar);
  const setActiveAvatar = useSessionStore((s) => s.setActiveAvatar);
    const skipAvatars = useSessionStore((s) => s.skipAvatars);

  const [categoryIndex, setCategoryIndex] = useState(0);
  const [accessorySlot, setAccessorySlot] = useState(0);
  const [showDrawingTools, setShowDrawingTools] = useState(false);

  const currentCategory = categories[categoryIndex];

  function previousCategory() {
    setCategoryIndex((current) =>
      current === 0 ? categories.length - 1 : current - 1
    );
  }

  function nextCategory() {
    setCategoryIndex((current) =>
      current === categories.length - 1 ? 0 : current + 1
    );
  }

  function handleItemSelect(category, itemId) {
    setAvatarItem(category, itemId);

    if (category === "top") {
      setAvatarColor("topColor", "#B0B0B0");
    }

    if (category === "bottom") {
      setAvatarColor("bottomColor", "#B0B0B0");
    }
  }

  function handleAccessorySelect(slotIndex, itemId) {
    updateAccessorySlot(slotIndex, { item: itemId });
  }

  function handleRandomize() {
    // Randomize all non-accessory avatar features.
    Object.entries(RANDOM_POOLS).forEach(([category, ids]) => {
      setAvatarItem(category, pick(ids));
    });

    // Randomize all non-accessory colours.
    Object.entries(RANDOM_COLORS).forEach(([category, colors]) => {
      if (category !== "accessoryColor") {
        setAvatarColor(category, pick(colors));
      }
    });

    // Randomize four accessory slots without duplicate items.
    const accessoryIds = [1, 2, 3, 4];

    const shuffled = [...accessoryIds].sort(
      () => Math.random() - 0.5
    );

    const occupiedCount = Math.floor(Math.random() * 5);
    const occupiedSlots = new Set(
      shuffled.slice(0, occupiedCount).map((_, index) => index)
    );

    const slots = Array.from({ length: 4 }, (_, index) => ({
      item: occupiedSlots.has(index) ? shuffled[index] : null,
      color: pick(RANDOM_COLORS.accessoryColor),
    }));

    slots.forEach((slot, index) => {
      updateAccessorySlot(index, slot);
    });
  }

  function handleReset() {
    resetAvatar();
    setCategoryIndex(0);
    setShowDrawingTools(false);
  }


  async function handleSaveAvatar() {
    setSaveMessage("");

    if (isGuest || !isAuthenticated) {
      const wantsToLogin = window.confirm(
        "You need an account to save avatars permanently. Go to login?"
      );

      if (wantsToLogin) {
        navigate("/login");
      }
      return;
    }

    try {
      setIsSavingAvatar(true);

      const result = await api.get("/users/avatars");
      const currentSavedAvatars = (result.avatars || []).slice(0, 5);

      if (currentSavedAvatars.length < 5) {
        const nextAvatars = [
          ...currentSavedAvatars,
          { ...avatarConfig },
        ];

        await api.put("/users/avatars", {
          avatars: nextAvatars,
        });

        setSaveMessage("Avatar saved to your account!");
        return;
      }

      // All five slots are full: open the visual selection dialog.
      setSavedAvatars(currentSavedAvatars);
      setSelectedReplaceIndex(null);
      setShowReplaceDialog(true);

    } catch (error) {
      setSaveMessage(error.message || "Could not save avatar.");
    } finally {
      setIsSavingAvatar(false);
    }
  }

  async function handleReplaceAvatar() {
    if (selectedReplaceIndex === null) return;

    try {
      setIsSavingAvatar(true);

      const nextAvatars = [...savedAvatars];

      nextAvatars[selectedReplaceIndex] = {
        ...avatarConfig,
      };

      await api.put("/users/avatars", {
        avatars: nextAvatars,
      });

      setSavedAvatars(nextAvatars);
      setShowReplaceDialog(false);
      setSelectedReplaceIndex(null);

      setSaveMessage(
        `Avatar ${selectedReplaceIndex + 1} replaced successfully!`
      );

    } catch (error) {
      setSaveMessage(error.message || "Could not replace avatar.");
    } finally {
      setIsSavingAvatar(false);
    }
  }


  
  
  function handleConfirm() {
    saveCurrentAvatar();

    const currentState = useSessionStore.getState();
    const ready = currentState.sessionAvatarReady || [];

    const allReady = Array.from(
      { length: currentState.avatarCount },
      (_, index) => ready[index] === true ||
        index === currentState.activeAvatarIndex
    ).every(Boolean);

    if (allReady) {
      navigate("/photo-choice");
      return;
    }

    const nextIndex = ready.findIndex(
      (isReady, index) =>
        !isReady && index !== currentState.activeAvatarIndex
    );

    if (nextIndex !== -1) {
      currentState.setActiveAvatar(nextIndex);
      return;
    }

    navigate("/photo-choice");
  }


  function handleSkip() {
    skipAvatars();
    navigate("/photo-choice");
  }


  return (
    <main className="page">
      <section className="avatar-design-page">

        {/* =========================
            LEFT — AVATAR PREVIEW
        ========================= */}

        <div className="avatar-preview-section">

                    <p className="section-label">
            AVATAR PREVIEW ({activeAvatarIndex + 1} of {avatarCount})
          </p>

          <div className="avatar-preview">
            <CharacterPreview
              avatarConfig={avatarConfig}
              avatarView={avatarView}
              skinColor={avatarConfig.skinColor}
              hairColor={avatarConfig.hairColor}
            />

            {showDrawingTools && (
              <CharacterDraw
                drawing={avatarConfig.drawing}
                onDrawingChange={setAvatarDrawing}
              />
            )}
          </div>


          {/* Bottom buttons */}

          <div className="avatar-actions">
            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isSavingAvatar}
            >
              {isSavingAvatar ? "Saving..." : "Save Avatar ♡"}
            </button>

            <button
              className="primary-action"
              onClick={handleConfirm}
            >
                            {activeAvatarIndex < avatarCount - 1
                ? "Save & next avatar →"
                : "Confirm →"}
            </button>

            <button onClick={handleSkip}>
              Skip
            </button>

            <button onClick={handleRandomize}>
              Randomize
            </button>

            <button onClick={handleReset}>
              Reset
            </button>

          </div>

          {saveMessage && (
            <p role="status" className="avatar-save-message">
              {saveMessage}
            </p>
          )}

          {showReplaceDialog && (
            <div className="replace-avatar-overlay">
              <div
                className="replace-avatar-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="replace-avatar-title"
              >
                <h2 id="replace-avatar-title">
                  ALL AVATAR SLOTS ARE FULL!
                </h2>

                <p>
                  Select the avatar you want to replace with your new design.
                </p>

                <div className="replace-avatar-grid">
                  {savedAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`replace-avatar-slot ${
                        selectedReplaceIndex === index ? "selected" : ""
                      }`}
                      onClick={() => setSelectedReplaceIndex(index)}
                      aria-pressed={selectedReplaceIndex === index}
                    >
                      <span>AVATAR {index + 1}</span>

                      <CharacterPreview
                        avatarConfig={avatar}
                        avatarView="full"
                        skinColor={avatar.skinColor}
                        hairColor={avatar.hairColor}
                      />

                      <span>
                        {selectedReplaceIndex === index
                          ? "✓ SELECTED"
                          : "SELECT"}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="replace-avatar-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplaceDialog(false);
                      setSelectedReplaceIndex(null);
                    }}
                    disabled={isSavingAvatar}
                  >
                    CANCEL
                  </button>

                  <button
                    type="button"
                    className="replace-confirm-button"
                    onClick={handleReplaceAvatar}
                    disabled={
                      selectedReplaceIndex === null || isSavingAvatar
                    }
                  >
                    {isSavingAvatar ? "SAVING..." : "REPLACE AVATAR"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>


        {/* =========================
            RIGHT — CONTROLS
        ========================= */}

        <div className="avatar-controls">

          <div className="avatar-customization-controls">

            {/* Full / Half view */}

            <div className="view-toggle">

              <button
                className={avatarView === "full" ? "active" : ""}
                onClick={() => setAvatarView("full")}
              >
                Full View
              </button>

              <button
                className={avatarView === "half" ? "active" : ""}
                onClick={() => setAvatarView("half")}
              >
                Half View
              </button>

            </div>


            {/* Category navigation */}

            <div className="category-control">

              <button
                className="category-arrow"
                onClick={previousCategory}
              >
                ←
              </button>

              <span className="category-name">
                {currentCategory.label}
              </span>

              <button
                className="category-arrow"
                onClick={nextCategory}
              >
                →
              </button>

            </div>


            {/* Actual item picker */}

            {/* Accessory slot selector */}
            {currentCategory.id === "accessories" && (
              <div className="accessory-slot-selector">
                {[0, 1, 2, 3].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={
                      accessorySlot === slot
                        ? "accessory-slot-button active"
                        : "accessory-slot-button"
                    }
                    onClick={() => setAccessorySlot(slot)}
                  >
                    Accessory {slot + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Actual item picker */}
            {currentCategory.id !== "skinTone" && (
              <ItemPicker
                category={currentCategory.id}
                selected={avatarConfig}
                onSelect={handleItemSelect}
                avatarView={avatarView}
                accessorySlot={accessorySlot}
                onAccessorySelect={handleAccessorySelect}
              />
            )}

            {currentCategory.id === "eyes" && (
              <div className="sprite-colour-picker">

                <div className="sprite-colour-label">
                  Eye Colour
                </div>

                <button
                  type="button"
                  className="colour-swatch"
                  style={{ background: "#222222" }}
                  onClick={() =>
                    setAvatarColor("eyesColor", "#222222")
                  }
                />

                <button
                  type="button"
                  className="colour-swatch"
                  style={{ background: "#4A2F24" }}
                  onClick={() =>
                    setAvatarColor("eyesColor", "#4A2F24")
                  }
                />

                <button
                  type="button"
                  className="colour-swatch"
                  style={{ background: "#3B6E8C" }}
                  onClick={() =>
                    setAvatarColor("eyesColor", "#3B6E8C")
                  }
                />

                <button
                  type="button"
                  className="colour-swatch"
                  style={{ background: "#4F7A3A" }}
                  onClick={() =>
                    setAvatarColor("eyesColor", "#4F7A3A")
                  }
                />

                <div className="custom-colour">
                  <span>Custom</span>

                  <input
                    type="color"
                    value={
                      avatarConfig.eyesColor || "#222222"
                    }
                    onChange={(e) =>
                      setAvatarColor(
                        "eyesColor",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>
            )}

            {currentCategory.id === "lips" && (
              <div className="sprite-colour-picker">
                <span className="sprite-colour-label">
                  Lip Colour
                </span>

                {RANDOM_COLORS.lipsColor.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="colour-swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => setAvatarColor("lipsColor", color)}
                    aria-label={`Select lip colour ${color}`}
                  />
                ))}

                <label className="custom-colour">
                  Custom

                  <input
                    type="color"
                    value={avatarConfig.lipsColor || "#B05A78"}
                    onChange={(event) =>
                      setAvatarColor("lipsColor", event.target.value)
                    }
                  />
                </label>
              </div>
            )}

            {currentCategory.id === "hair" && (
              <div className="sprite-colour-picker">
                <span className="sprite-colour-label">
                  Hair Colour
                </span>

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#222222" }}
                  onClick={() =>
                    setAvatarColor("hairColor", "#222222")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#5B321F" }}
                  onClick={() =>
                    setAvatarColor("hairColor", "#5B321F")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#8B5A2B" }}
                  onClick={() =>
                    setAvatarColor("hairColor", "#8B5A2B")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#D4A72C" }}
                  onClick={() =>
                    setAvatarColor("hairColor", "#D4A72C")
                  }
                />

                <label className="custom-colour">
                  Custom

                  <input
                    type="color"
                    value={
                      avatarConfig.hairColor || "#222222"
                    }
                    onChange={(event) =>
                      setAvatarColor(
                        "hairColor",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            )}

            {currentCategory.id === "top" && (
              <div className="sprite-colour-picker">
                <span className="sprite-colour-label">
                  Top Colour
                </span>

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#B0B0B0" }}
                  onClick={() =>
                    setAvatarColor("topColor", "#B0B0B0")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#6B7280" }}
                  onClick={() =>
                    setAvatarColor("topColor", "#6B7280")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#4F46E5" }}
                  onClick={() =>
                    setAvatarColor("topColor", "#4F46E5")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#D97706" }}
                  onClick={() =>
                    setAvatarColor("topColor", "#D97706")
                  }
                />

                <label className="custom-colour">
                  Custom
                  <input
                    type="color"
                    value={avatarConfig.topColor || "#B0B0B0"}
                    onChange={(event) =>
                      setAvatarColor(
                        "topColor",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            )}

            {currentCategory.id === "bottom" && (
              <div className="sprite-colour-picker">
                <span className="sprite-colour-label">
                  Pants Colour
                </span>

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#B0B0B0" }}
                  onClick={() =>
                    setAvatarColor("bottomColor", "#B0B0B0")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#4B5563" }}
                  onClick={() =>
                    setAvatarColor("bottomColor", "#4B5563")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#2563EB" }}
                  onClick={() =>
                    setAvatarColor("bottomColor", "#2563EB")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#7C3AED" }}
                  onClick={() =>
                    setAvatarColor("bottomColor", "#7C3AED")
                  }
                />

                <label className="custom-colour">
                  Custom
                  <input
                    type="color"
                    value={avatarConfig.bottomColor || "#B0B0B0"}
                    onChange={(event) =>
                      setAvatarColor(
                        "bottomColor",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            )}

            {currentCategory.id === "footwear" && (
              <div className="sprite-colour-picker">
                <span className="sprite-colour-label">
                  Shoes Colour
                </span>

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#222222" }}
                  onClick={() =>
                    setAvatarColor("footwearColor", "#222222")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#6B7280" }}
                  onClick={() =>
                    setAvatarColor("footwearColor", "#6B7280")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#2563EB" }}
                  onClick={() =>
                    setAvatarColor("footwearColor", "#2563EB")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#DC2626" }}
                  onClick={() =>
                    setAvatarColor("footwearColor", "#DC2626")
                  }
                />

                <label className="custom-colour">
                  Custom

                  <input
                    type="color"
                    value={
                      avatarConfig.footwearColor || "#222222"
                    }
                    onChange={(event) =>
                      setAvatarColor(
                        "footwearColor",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            )}

            {currentCategory.id === "skinTone" && (
              <div className="sprite-colour-picker">
                <span className="sprite-colour-label">
                  Skin Colour
                </span>

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#F1C6A5" }}
                  onClick={() =>
                    setAvatarColor("skinColor", "#F1C6A5")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#D99A78" }}
                  onClick={() =>
                    setAvatarColor("skinColor", "#D99A78")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#B97856" }}
                  onClick={() =>
                    setAvatarColor("skinColor", "#B97856")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#8D5A3B" }}
                  onClick={() =>
                    setAvatarColor("skinColor", "#8D5A3B")
                  }
                />

                <label className="custom-colour">
                  Custom

                  <input
                    type="color"
                    value={
                      avatarConfig.skinColor || "#B97856"
                    }
                    onChange={(event) =>
                      setAvatarColor(
                        "skinColor",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            )}

            {currentCategory.id === "accessories" && (
              <div className="sprite-colour-picker">
                <span className="sprite-colour-label">
                  Accessory {accessorySlot + 1} Colour
                </span>

                {RANDOM_COLORS.accessoryColor.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="colour-swatch"
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      updateAccessorySlot(accessorySlot, { color })
                    }
                    aria-label={`Select accessory colour ${color}`}
                  />
                ))}

                <label className="custom-colour">
                  Custom

                  <input
                    type="color"
                    value={
                      avatarConfig.accessories?.[accessorySlot]?.color ||
                      "#222222"
                    }
                    onChange={(event) =>
                      updateAccessorySlot(accessorySlot, {
                        color: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            )}


            {/* Drawing */}

            <button
              className="drawing-tools"
              type="button"
              onClick={() =>
                setShowDrawingTools((current) => !current)
              }
            >
              {showDrawingTools ? "Hide Drawing Tools" : "Drawing Tools"}
            </button>

          </div>  

        </div>

      </section>
    </main>
  );
}