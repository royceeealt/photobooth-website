import React, {
  useEffect,
  useRef,
  useState,
} from "react";

export default function CharacterDraw({
  drawing,
  onDrawingChange,
}) {
  const canvasRef = useRef(null);

  const [color, setColor] = useState("#222222");
  const [size, setSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !drawing) return;

    const context = canvas.getContext("2d");

    const image = new Image();

    image.onload = () => {
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    image.src = drawing;
  }, [drawing]);

  function getPosition(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.floor((event.clientX - rect.left) * scaleX),
      y: Math.floor((event.clientY - rect.top) * scaleY),
    };
  }

  function saveSnapshot() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const snapshot = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);

    setHistory((currentHistory) => {
        const trimmedHistory =
        historyIndex >= 0
            ? currentHistory.slice(0, historyIndex + 1)
            : currentHistory;

        const newHistory = [
        ...trimmedHistory,
        snapshot,
        ];

        setHistoryIndex(newHistory.length - 1);

        return newHistory;
    });
  }

  function startDrawing(event) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    saveSnapshot();

    const { x, y } = getPosition(event);

    context.fillStyle = isEraser
      ? "rgba(0, 0, 0, 1)"
      : color;

    context.globalCompositeOperation = isEraser
      ? "destination-out"
      : "source-over";

    context.fillRect(x, y, size, size);

    setIsDrawing(true);
  }

  function draw(event) {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const { x, y } = getPosition(event);

    context.fillStyle = isEraser
      ? "rgba(0, 0, 0, 1)"
      : color;

    context.globalCompositeOperation = isEraser
      ? "destination-out"
      : "source-over";

    context.fillRect(x, y, size, size);
  }

  function stopDrawing() {
    setIsDrawing(false);

    const canvas = canvasRef.current;

    if (!canvas || !onDrawingChange) return;

    onDrawingChange(
        canvas.toDataURL("image/png")
    );
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    saveSnapshot();

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  function undo() {
    if (historyIndex <= 0) {
        clearCanvas();
        setHistoryIndex(-1);
        return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const previousSnapshot = history[historyIndex - 1];

    context.putImageData(previousSnapshot, 0, 0);

    setHistoryIndex((currentIndex) => currentIndex - 1);
  }

  function redo() {
    if (historyIndex >= history.length - 1) {
        return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const nextSnapshot = history[historyIndex + 1];

    context.putImageData(nextSnapshot, 0, 0);

    setHistoryIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <div className="character-draw">
      <div className="character-draw__toolbar">
        <label>
          Colour
          <input
            type="color"
            value={color}
            onChange={(event) =>
              setColor(event.target.value)
            }
          />
        </label>

        <label>
          Pixel Size
          <select
            value={size}
            onChange={(event) =>
              setSize(Number(event.target.value))
            }
          >
            <option value="1">1 px</option>
            <option value="2">2 px</option>
            <option value="4">4 px</option>
            <option value="8">8 px</option>
            <option value="12">12 px</option>
          </select>
        </label>

        <button
            type="button"
            onClick={() =>
                setIsEraser((current) => !current)
            }
        >
            {isEraser ? "Brush" : "Eraser"}
        </button>

        <button
            type="button"
            onClick={undo}
        >
            Undo
        </button>

        <button
            type="button"
            onClick={redo}
        >
            Redo
        </button>

        <button
            type="button"
            onClick={clearCanvas}
        >
            Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={360}
        height={480}
        className="character-draw__canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}