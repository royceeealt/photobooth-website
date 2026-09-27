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

  const accessoryColor =
    avatarConfig.accessoryColor || "#222222";

  const isFullBody = avatarView === "full";

  const isHalfView = avatarView === "half";

  const getAssetPath = (items, id) => {
    const item = items?.find((item) => item.id === id);

    if (!item) return undefined;

    return isHalfView
      ? item.halfAssetPath || item.assetPath
      : item.assetPath;
  };

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

        {/* Body sprite */}
        {avatarConfig.body && catalog && (
          <PixelSprite
            src={getAssetPath(
              catalog.body,
              avatarView === "half"
                ? "body_half"
                : avatarConfig.body
            )}
            color={skinColor}
            region="skin"
          />
        )}

        {/* Real eye sprite */}
        {avatarConfig.eyes && catalog && (
          <PixelSprite
            src={
              avatarView === "half"
                ? catalog.eyes?.find(
                    (item) => item.id === avatarConfig.eyes
                  )?.halfAssetPath
                : catalog.eyes?.find(
                    (item) => item.id === avatarConfig.eyes
                  )?.assetPath
            }
            color={avatarConfig.eyesColor || "#222222"}
          />
        )}

        {/* Real lips sprite */}
        {avatarConfig.lips && catalog && (
          <PixelSprite
            src={getAssetPath(
              catalog.lips,
              avatarConfig.lips
            )}
            color={lipsColor}
          />
        )}

        {/* Real bottom sprite */}
        {avatarConfig.bottom && catalog && avatarView === "full" && (
          <PixelSprite
            src={
              catalog.bottom?.find(
                (item) => item.id === avatarConfig.bottom
              )?.assetPath
            }
            color={bottomColor}
          />
        )}

        {/* Real top sprite */}
        {avatarConfig.top && catalog && avatarView === "full" && (
          <PixelSprite
            src={
              catalog.top?.find(
                (item) => item.id === avatarConfig.top
              )?.assetPath
            }
            color={topColor}
          />
        )}

        {/* Real footwear sprite */}
        {avatarConfig.footwear && catalog && avatarView === "full" && (
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
            src={getAssetPath(
              catalog.hair,
              avatarConfig.hair
            )}
            color={hairColor}
          />
        )}

        {/* Real accessory sprite */}
        {/* Accessories */}
        {avatarConfig.accessory && catalog && (
          <PixelSprite
            src={
              catalog.accessory?.find(
                (item) => item.id === avatarConfig.accessory
              )?.assetPath
            }
            color={accessoryColor}
          />
        )}
      </div>
    </div>
  );
}