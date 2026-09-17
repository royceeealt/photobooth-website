import { useNavigate } from "react-router-dom";
import ItemPicker from "../components/ItemPicker.jsx";
import useSessionStore from "../store/useSessionStore.js";

// Pick hair / skinTone / accessory ids for the avatar that will follow
// the user into every shot.
export default function AvatarDesign() {
  const navigate = useNavigate();
  const avatarConfig = useSessionStore((s) => s.avatarConfig);
  const setAvatarItem = useSessionStore((s) => s.setAvatarItem);

  const isComplete = avatarConfig.hair && avatarConfig.skinTone; // accessory optional

  return (
    <div className="avatar-design-page">
      <h1>Design Your Avatar</h1>
      <ItemPicker selected={avatarConfig} onSelect={setAvatarItem} />
      <button onClick={() => navigate("/capture")} disabled={!isComplete}>
        Continue to Camera
      </button>
    </div>
  );
}
