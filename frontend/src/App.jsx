import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import StripCount from "./pages/StripCount.jsx";
import AvatarDesign from "./pages/AvatarDesign.jsx";
import ImageCapture from "./pages/ImageCapture.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PhotoChoice from "./pages/PhotoChoice.jsx";

import PolaroidDesign from "./pages/PolaroidDesign.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-background" />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/strip-count" element={<StripCount />} />

          <Route path="/avatar-design" element={<AvatarDesign />} />

          <Route path="/photo-choice" element={<PhotoChoice />} />

          <Route path="/photo-editor" element={<Navigate to="/polaroid-design" replace />} />

          <Route path="/capture" element={<ImageCapture />} />
          <Route
  path="/polaroid-design"
  element={<PolaroidDesign />}
/>
        </Routes>
      </div>
    </div>
  );
}