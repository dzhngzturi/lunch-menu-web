// src/ui/Segmented.jsx
export function Segmented({ value, onChange, options = [], disabled = false }) {
  return (
    <div className={`segmented ${disabled ? "is-disabled" : ""}`} role="radiogroup">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          disabled={disabled}
          className={`seg-item ${opt.value} ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
          title={opt.label}
        >
          {opt.icon ? <i className={opt.icon} aria-hidden="true" /> : null}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
