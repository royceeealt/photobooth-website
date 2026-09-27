import React from "react";
import { useLocation } from "react-router-dom";



export default function PhotoEditor() {
    const location = useLocation();

    const images = location.state?.images || [];
    const currentImage = images[0];
    return (
        <main className="photo-editor-page">

        <section className="photo-editor-workspace">

            {/* Main photo */}
            <div className="photo-editor-preview">
            <div className="photo-editor-placeholder">
                {currentImage ? (
                    <img
                    src={currentImage}
                    alt="Selected"
                    className="photo-editor-image"
                    />
                ) : (
                    <span>PHOTO</span>
                )}
            </div>

            <div className="photo-editor-actions">
                <button type="button">
                Confirm
                </button>

                <button type="button">
                Redo
                </button>
            </div>
            </div>

            {/* Editor controls */}
            <aside className="photo-editor-controls">

            <div className="editor-control">
                <button type="button">
                ←
                </button>

                <div className="editor-control-display">
                Polaroid
                </div>

                <button type="button">
                →
                </button>
            </div>

            <div className="editor-control">
                <button type="button">
                ←
                </button>

                <div className="editor-control-display">
                Avatar
                </div>

                <button type="button">
                →
                </button>
            </div>

            <div className="editor-control">
                <button type="button">
                ←
                </button>

                <div className="editor-control-display">
                Props
                </div>

                <button type="button">
                →
                </button>
            </div>

            <button
                type="button"
                className="editor-drawing-tools"
            >
                Drawing Tools
            </button>

            </aside>

        </section>

        </main>
    );
    }