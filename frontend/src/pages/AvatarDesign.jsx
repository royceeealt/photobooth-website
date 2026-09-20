import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ItemPicker from "../components/ItemPicker.jsx";
import ColorPicker from "../components/character/ColorPicker.jsx";
import CharacterDraw from "../components/character/CharacterDraw.jsx";

import useSessionStore from "../store/useSessionStore.js";

import CharacterPreview from "../components/character/CharacterPreview.jsx";


const categories = [
  {
    id: "hair",
    label: "Hair",
  },
  {
    id: "eyes",
    label: "Eyes",
  },
  {
    id: "lips",
    label: "Lips",
  },
  {
    id: "top",
    label: "Top",
  },
  {
    id: "bottom",
    label: "Bottom",
  },
  {
    id: "footwear",
    label: "Shoes",
  },
  {
    id: "skinTone",
    label: "Skin Tone",
  },
  {
    id: "accessory",
    label: "Accessories",
  },
];

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

  const [categoryIndex, setCategoryIndex] = useState(0);
  const [skinColor, setSkinColor] = useState("#D99A78");
  const [hairColor, setHairColor] = useState("#222222");
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

    if (category === "skinTone") {
      const skinColors = {
        skin_01: "#F1C6A5",
        skin_02: "#8D5A3B",
      };

      setAvatarColor(
        "skinColor",
        skinColors[itemId] || "#B97856"
      );
    }

    if (category === "top") {
      setAvatarColor("topColor", "#B0B0B0");
    }

    if (category === "bottom") {
      setAvatarColor("bottomColor", "#B0B0B0");
    }
  }

  function handleRandomize() {
    const randomHair = ["hair_01", "hair_02"];
    const randomSkin = ["skin_01", "skin_02"];
    const randomAccessory = ["acc_01", "acc_02"];

    setAvatarItem(
      "hair",
      randomHair[Math.floor(Math.random() * randomHair.length)]
    );

    setAvatarItem(
      "skinTone",
      randomSkin[Math.floor(Math.random() * randomSkin.length)]
    );

    setAvatarItem(
      "accessory",
      randomAccessory[Math.floor(Math.random() * randomAccessory.length)]
    );
  }

  function handleReset() {
    resetAvatar();
    setCategoryIndex(0);
    setShowDrawingTools(false);
  }

  function handleConfirm() {
    navigate("/capture");
  }

  function handleSkip() {
    navigate("/capture");
  }

  return (
    <main className="page">
      <section className="avatar-design-page">

        {/* =========================
            LEFT — AVATAR PREVIEW
        ========================= */}

        <div className="avatar-preview-section">

          <p className="section-label">
            AVATAR PREVIEW
          </p>

          <div className="avatar-preview">
            <CharacterPreview
              avatarConfig={avatarConfig}
              avatarView={avatarView}
              skinColor={skinColor}
              hairColor={hairColor}
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
              Confirm →
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

          <ItemPicker
            category={currentCategory.id}
            selected={avatarConfig}
            onSelect={handleItemSelect}
          />

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

      </section>
    </main>
  );
}