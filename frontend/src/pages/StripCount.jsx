import { useNavigate } from "react-router-dom";
import useSessionStore from "../store/useSessionStore.js";

const OPTIONS = [3, 4, 6];

// Client-state only — picks how many shots go on the final strip.
export default function StripCount() {
  const navigate = useNavigate();
  const stripCount = useSessionStore((s) => s.stripCount);
  const setStripCount = useSessionStore((s) => s.setStripCount);

  function handleContinue() {
    if (!stripCount) return;
    navigate("/avatar-design");
  }

  return (
    <div className="strip-count-page">
      <h1>How many photos?</h1>
      <div className="strip-count-options">
        {OPTIONS.map((count) => (
          <button
            key={count}
            className={stripCount === count ? "selected" : ""}
            onClick={() => setStripCount(count)}
          >
            {count}
          </button>
        ))}
      </div>
      <button onClick={handleContinue} disabled={!stripCount}>
        Continue
      </button>
    </div>
  );
}
