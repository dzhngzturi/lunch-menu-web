// src/ui/TwoStateSwitch.jsx
export function TwoStateSwitch({
  value,
  onChange,
  left = { value: "in_progress", label: "В процес" },
  right = { value: "ready", label: "Готово" },
  disabled = false,
}) {
  const isRight = value === right.value;
  const next = isRight ? left : right;

  return (
    <button
      type="button"
      className={`two-switch ${isRight ? "right" : "left"}`}
      disabled={disabled}
      onClick={() => onChange(next.value)}
      title={`Смени на "${next.label}"`}
      aria-label={`Смени на "${next.label}"`}
    >
      <span className="pill">{isRight ? right.label : left.label}</span>
    </button>
  );
}
