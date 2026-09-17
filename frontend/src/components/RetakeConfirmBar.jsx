// Bottom action bar shown after a shot is taken: retake it or keep it and move on.
export default function RetakeConfirmBar({ onRetake, onConfirm, disabled = false }) {
  return (
    <div className="retake-confirm-bar">
      <button onClick={onRetake} disabled={disabled}>
        Retake
      </button>
      <button onClick={onConfirm} disabled={disabled}>
        Confirm &amp; Continue
      </button>
    </div>
  );
}
