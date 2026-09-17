import { Link, Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";

// Landing / gate page: send logged-in users straight into the flow,
// otherwise offer login or signup.
export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/strip-count" replace />;
  }

  return (
    <div className="home-page">
      <h1>Pixel Photobooth</h1>
      <p>Take a photo strip and design a pixel-art avatar to go with it.</p>
      <Link to="/login">Log in</Link>
      <Link to="/signup">Sign up</Link>
    </div>
  );
}
