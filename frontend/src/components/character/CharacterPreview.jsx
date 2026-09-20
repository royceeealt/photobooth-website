import React, { useEffect, useState } from "react";
import { loadItemCatalog } from "../../lib/itemCatalog.js";
import PixelSprite from "./PixelSprite.jsx";

export default function CharacterPreview({
  avatarConfig,
  avatarView,
}) {
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    loadItemCatalog()
      .then(setCatalog)
      .catch(console.error);
  }, []);

  const skinColor =
    avatarConfig.skinColor || "#B97856";

  const hairColor =
    avatarConfig.hairColor || "#222222";

  const topColor =
    avatarConfig.topColor || "#B0B0B0";

  const bottomColor =
    avatarConfig.bottomColor || "#B0B0B0";

  const lipsColor =
    avatarConfig.lipsColor || "#B05A78";

  const isFullBody = avatarView === "full";

  return (
    <div
      className={`character-preview ${
        isFullBody
          ? "character-preview--full"
          : "character-preview--half"
      }`}
    >
      <div className="character-stage">
        {/* Temporary skin/face.
            This will eventually be replaced by the real
            skin/body sprite from your teammate. */}

        {avatarConfig.body && catalog && (
          <PixelSprite
            src={
              catalog.body?.find(
                (item) => item.id === avatarConfig.body
              )?.assetPath
            }
            color={skinColor}
            region="skin"
          />
        )}

        {/* Real eye sprite */}
        {avatarConfig.eyes && catalog && (
          <img
            className="character-sprite"
            src={
              catalog.eyes?.find(
                (item) => item.id === avatarConfig.eyes
              )?.assetPath
            }
            alt=""
          />
        )}

        {/* Real lips sprite */}
        {avatarConfig.lips && catalog && (
          <PixelSprite
            src={
              catalog.lips?.find(
                (item) => item.id === avatarConfig.lips
              )?.assetPath
            }
            color={lipsColor}
          />
        )}

        {/* Real top sprite */}
        {avatarConfig.top && catalog && (
          <PixelSprite
            src={
              catalog.top?.find(
                (item) => item.id === avatarConfig.top
              )?.assetPath
            }
            color={topColor}
          />
        )}

        {/* Real bottom sprite */}
        {avatarConfig.bottom && catalog && (
          <PixelSprite
            src={
              catalog.bottom?.find(
                (item) => item.id === avatarConfig.bottom
              )?.assetPath
            }
            color={bottomColor}
          />
        )}

        {/* Real footwear sprite */}
        {avatarConfig.footwear && catalog && (
          <PixelSprite
            src={
              catalog.footwear?.find(
                (item) => item.id === avatarConfig.footwear
              )?.assetPath
            }
            color={avatarConfig.footwearColor || "#222222"}
          />
        )}

        {/* Real hair sprite */}
        {avatarConfig.hair && catalog && (
          <PixelSprite
            src={
              catalog.hair?.find(
                (item) => item.id === avatarConfig.hair
              )?.assetPath
            }
            color={hairColor}
          />
        )}
      </div>
    </div>
  );
}