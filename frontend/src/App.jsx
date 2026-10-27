import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import StripCount from "./pages/StripCount.jsx";
import AvatarSelection from "./pages/AvatarSelection.jsx";
import AvatarDesign from "./pages/AvatarDesign.jsx";
import PhotoChoice from "./pages/PhotoChoice.jsx";
import ImageCapture from "./pages/ImageCapture.jsx";
import PolaroidDesign from "./pages/PolaroidDesign.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-background" />

      <div className="app-content">
        <Routes>
          {/* Public pages: no logout button */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Only these routes display the logout button */}
          <Route element={<ProtectedRoute />}>
            <Route path="/strip-count" element={<StripCount />} />
            <Route path="/avatar-selection" element={<AvatarSelection />} />
            <Route path="/avatar-design" element={<AvatarDesign />} />
            <Route path="/photo-choice" element={<PhotoChoice />} />
            <Route path="/capture" element={<ImageCapture />} />
            <Route path="/polaroid-design" element={<PolaroidDesign />} />

            <Route
              path="/photo-editor"
              element={
                <Navigate to="/polaroid-design" replace />
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}