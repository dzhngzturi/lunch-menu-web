// src/components/LoaderOverlay.jsx
export default function LoaderOverlay({
  text = "Зареждам…",
  color = "#3b82f6",
  size = 40,
  backdrop = "rgba(255,255,255,.7)"
}) {
  return (
    <div
      style={{
        position: "absolute",     // важно: заема зоната на content-а
        inset: 0,
        background: backdrop,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        zIndex: 10,
      }}
    >
      <div
        className="spinner"
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}`,
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <div style={{ color: "#374151", fontWeight: 500 }}>{text}</div>
    </div>
  );
}
