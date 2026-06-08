export const btnStyle = (bg, color, border) => ({
    padding: "9px 18px",
    borderRadius: 99,
    border: `1.5px solid ${border || bg}`,
    background: bg,
    color,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "opacity 0.15s",
});