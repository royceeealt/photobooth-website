// List of props the user can place on the Polaroid.
// To add a prop: put a transparent PNG in public/assets/props/ and add a line
// here. width/height are the image's real pixel size.

// Props are drawn this many times larger than their pixel size on the
// 1080-wide Polaroid canvas (keeps pixel art crisp).
const PROP_PIXEL_SCALE = 5;

export const propCatalog = [
  { id: "cherry",       name: "Cherry",      image: "/assets/props/cherry.png",         width: 64, height: 64 },
  { id: "jelly-frame0", name: "Ghost",       image: "/assets/props/jelly-frame0.png",   width: 64, height: 64 },
  { id: "prop2-frame0", name: "Strawberry",  image: "/assets/props/prop2-frame0.png",   width: 64, height: 64 },
  { id: "prop4-frame0", name: "Vinyl",       image: "/assets/props/prop4-frame0.png",   width: 64, height: 64 },
  { id: "prop5-frame0", name: "Sparkle",     image: "/assets/props/prop5-frame0.png",   width: 64, height: 64 },
  { id: "prop6-frame0", name: "Heart chat",  image: "/assets/props/prop6-frame0.png",   width: 64, height: 64 },
  { id: "prop7-frame0", name: "Potion",      image: "/assets/props/prop7-frame0.png",   width: 64, height: 64 },
];

export function getProp(id) {
  return propCatalog.find((p) => p.id === id) || null;
}

// Size of a prop on the Polaroid canvas at scale 1.
export function getPropBaseSize(prop) {
  return {
    width: prop.width * PROP_PIXEL_SCALE,
    height: prop.height * PROP_PIXEL_SCALE,
  };
}