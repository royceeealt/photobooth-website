import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function PhotoChoice() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const imageUrls = files.map((file) =>
      URL.createObjectURL(file)
    );

    navigate("/photo-editor", {
      state: {
        images: imageUrls,
      },
    });
  };

  return (
    <main className="photo-choice-page">
      <h1 className="photo-choice-title">
        CHOOSE YOUR PHOTO
      </h1>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileChange}
      />

      <div className="photo-choice-options">
        <button
          type="button"
          className="photo-choice-card"
          onClick={handleUploadClick}
        >
          <div className="photo-choice-placeholder">
            +
          </div>

          <span>
            Upload Pictures
          </span>
        </button>

        <button
          type="button"
          className="photo-choice-card"
          onClick={() => navigate("/camera")}
        >
          <div className="photo-choice-placeholder">
            📷
          </div>

          <span>
            Take Pictures
          </span>
        </button>
      </div>
    </main>
  );
}