import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  title,
  message,
  confirmText = "OK",
  cancelText = "Отказ",
  onConfirm,
  onCancel,
  danger = false,
}) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onCancel?.(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <h3 id="modal-title" className="modal-title">{title}</h3>
        {message && <p className="modal-msg">{message}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>{cancelText}</button>
          <button type="button" className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
