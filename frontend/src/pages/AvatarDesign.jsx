import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ItemPicker from "../components/ItemPicker.jsx";
import ColorPicker from "../components/character/ColorPicker.jsx";
import CharacterDraw from "../components/character/CharacterDraw.jsx";

import useSessionStore from "../store/useSessionStore.js";

import CharacterPreview from "../components/character/CharacterPreview.jsx";


const categories = [
  { id: "hair", label: "Hair" },
  { id: "eyes", label: "Eyes" },
  { id: "lips", label: "Lips" },
  { id: "top", label: "Top" },          // Must be "top" (matches MongoDB)
  { id: "bottom", label: "Bottom" },    // Must be "bottom" (matches MongoDB)
  { id: "footwear", label: "Shoes" },
  { id: "skinTone", label: "Skin Tone" },
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
  accessories: [null, 1, 2, 3, 4],
};

const RANDOM_SKIN_COLORS = ["#F1C6A5", "#D99A78", "#B97856", "#8D5A3B"];
const RANDOM_HAIR_COLORS = ["#222222", "#5B321F", "#8B5A2B", "#D4A72C"];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function AvatarDesign() {
  const navigate = useNavigate();

  const avatarConfig = useSessionStore((s) => s.avatarConfig);
  const setAvatarItem = useSessionStore((s) => s.setAvatarItem);
  const setAvatarColor = useSessionStore((s) => s.setAvatarColor);
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

  function handleRandomize() {
    Object.entries(RANDOM_POOLS).forEach(([category, ids]) =>
      setAvatarItem(category, pick(ids))
    );

    setAvatarColor("skinColor", pick(RANDOM_SKIN_COLORS));
    setAvatarColor("hairColor", pick(RANDOM_HAIR_COLORS));
  }

  function handleReset() {
    resetAvatar();
    setCategoryIndex(0);
    setShowDrawingTools(false);
  }

    function handleConfirm() {
    // Copy the avatar being edited into avatars[].
    saveCurrentAvatar();

    // More avatars to create? Load the next slot and stay on this page.
    if (activeAvatarIndex < avatarCount - 1) {
      setActiveAvatar(activeAvatarIndex + 1);
      setAvatarView("full");
      setCategoryIndex(0);
      setShowDrawingTools(false);
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

            {currentCategory.id !== "skinTone" && (
              <ItemPicker
                category={currentCategory.id}
                selected={avatarConfig}
                onSelect={handleItemSelect}
                avatarView={avatarView}
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
                  Accessory Colour
                </span>

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#222222" }}
                  onClick={() =>
                    setAvatarColor("accessoryColor", "#222222")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#7B3F22" }}
                  onClick={() =>
                    setAvatarColor("accessoryColor", "#7B3F22")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#2563EB" }}
                  onClick={() =>
                    setAvatarColor("accessoryColor", "#2563EB")
                  }
                />

                <button
                  className="colour-swatch"
                  style={{ backgroundColor: "#DC2626" }}
                  onClick={() =>
                    setAvatarColor("accessoryColor", "#DC2626")
                  }
                />

                <label className="custom-colour">
                  Custom

                  <input
                    type="color"
                    value={
                      avatarConfig.accessoryColor || "#222222"
                    }
                    onChange={(event) =>
                      setAvatarColor(
                        "accessoryColor",
                        event.target.value
                      )
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