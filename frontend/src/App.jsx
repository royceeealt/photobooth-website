import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import StripCount from "./pages/StripCount.jsx";
import AvatarDesign from "./pages/AvatarDesign.jsx";
import ImageCapture from "./pages/ImageCapture.jsx";
import Export from "./pages/Export.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// TODO: flesh out route guards — strip-count/avatar-design/capture/export
// probably need a completed prior step (e.g. can't hit /capture without a stripCount set).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/strip-count" element={<StripCount />} />

      <Route path="/avatar-design" element={<AvatarDesign />} />
      
      <Route
        path="/capture"
        element={
          <ProtectedRoute>
            <ImageCapture />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export"
        element={
          <ProtectedRoute>
            <Export />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
