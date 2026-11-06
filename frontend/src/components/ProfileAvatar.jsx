import React, { useEffect, useState } from "react";
import {
  getProfileAvatar,
  subscribeToProfileAvatar,
} from "../lib/profileAvatar.js";

export default function ProfileAvatar({ user, className = "", variant: variantOverride }) {
  const [variant, setVariant] = useState(() => getProfileAvatar(user));

  useEffect(() => {
    setVariant(getProfileAvatar(user));
    return subscribeToProfileAvatar(() => setVariant(getProfileAvatar(user)));
  }, [user]);

  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 8 8" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="#f2cf58" />
        {(variantOverride || variant) === "female" ? (
          <>
            {/* Long hair framing the face, with a visible neckline. */}
            <rect x="2" y="1" width="4" height="1" fill="#5b321f" />
            <rect x="1" y="2" width="1" height="4" fill="#5b321f" />
            <rect x="6" y="2" width="1" height="4" fill="#5b321f" />
            <rect x="2" y="2" width="4" height="3" fill="#d99a78" />
            <rect x="2" y="2" width="1" height="1" fill="#5b321f" />
            <rect x="4" y="2" width="1" height="1" fill="#5b321f" />
            <rect x="2" y="3" width="1" height="1" fill="#222" />
            <rect x="5" y="3" width="1" height="1" fill="#222" />
            <rect x="3" y="4" width="2" height="1" fill="#a84f63" />
            <rect x="3" y="5" width="2" height="1" fill="#d99a78" />
            <rect x="2" y="6" width="4" height="2" fill="#d45b86" />
            <rect x="1" y="6" width="1" height="1" fill="#d99a78" />
            <rect x="6" y="6" width="1" height="1" fill="#d99a78" />
          </>
        ) : (
          <>
            <rect x="2" y="1" width="4" height="1" fill="#222" />
            <rect x="1" y="2" width="6" height="3" fill="#b97856" />
            <rect x="2" y="3" width="1" height="1" fill="#222" />
            <rect x="5" y="3" width="1" height="1" fill="#222" />
            <rect x="2" y="6" width="4" height="2" fill="#222" />
          </>
        )}
      </svg>
    </span>
  );
}
