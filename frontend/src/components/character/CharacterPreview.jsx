
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

  // Resolve the regular asset URL.
  // Keep layers aligned using their original full sprites.
  const getAssetUrl = (items, id) => {
    const item = items?.find((item) => item.id === id);
    return item?.assetUrl;
  };

  // Only eyes use a dedicated half-view asset, matching
  // the rendering behavior from your friend's version.
  const getEyeAssetUrl = (id) => {
    const item = catalog?.eyes?.find(
      (item) => item.id === id
    );

    if (!item) return undefined;

    return isHalfView && item.halfAssetUrl
      ? item.halfAssetUrl
      : item.assetUrl;
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
        {/* Body: backend category is bodyType */}
        {avatarConfig.body != null && catalog && (
          <PixelSprite
            src={getAssetUrl(
              catalog.bodyType,
              avatarConfig.body
            )}
            color={skinColor}
            region="skin"
          />
        )}

        {/* Eyes: use the half-view sprite only when available */}
        {avatarConfig.eyes != null && catalog && (
          <PixelSprite
            src={getEyeAssetUrl(avatarConfig.eyes)}
            color={avatarConfig.eyesColor || "#222222"}
          />
        )}

        {/* Lips: retain the original full sprite */}
        {avatarConfig.lips != null && catalog && (
          <PixelSprite
            src={getAssetUrl(
              catalog.lips,
              avatarConfig.lips
            )}
            color={lipsColor}
          />
        )}

        {/* Bottom clothing */}
        {avatarConfig.bottom != null && catalog && (
          <PixelSprite
            src={getAssetUrl(
              catalog.bottom,
              avatarConfig.bottom
            )}
            color={bottomColor}
          />
        )}

        {/* Top clothing */}
        {avatarConfig.top != null && catalog && (
          <PixelSprite
            src={getAssetUrl(
              catalog.top,
              avatarConfig.top
            )}
            color={topColor}
          />
        )}

        {/* Footwear */}
        {avatarConfig.footwear != null && catalog && (
          <PixelSprite
            src={getAssetUrl(
              catalog.footwear,
              avatarConfig.footwear
            )}
            color={
              avatarConfig.footwearColor || "#222222"
            }
          />
        )}

        {/* Hair: retain the original full sprite */}
        {avatarConfig.hair != null && catalog && (
          <PixelSprite
            src={getAssetUrl(
              catalog.hair,
              avatarConfig.hair
            )}
            color={hairColor}
          />
        )}

        {/* Accessories: use the backend's plural field */}
        {/* Accessories: render all four accessory slots */}
        {Array.isArray(avatarConfig.accessories) &&
          catalog &&
          avatarConfig.accessories.map((accessory, index) => {
            if (!accessory?.item) return null;

            return (
              <PixelSprite
                key={`accessory-${index}`}
                src={getAssetUrl(
                  catalog.accessories,
                  accessory.item
                )}
                color={accessory.color || "#222222"}
              />
            );
          })}
      </div>
    </div>
  );
}
