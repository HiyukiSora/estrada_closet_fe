export const FilterPill = ({ label, active, onClick, count }) => {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1.5px solid",
                borderColor: active ? "#1a1208" : "#ede8e3",
                background: active ? "#1a1208" : "#fff",
                color: active ? "#fff" : "#7a6e65",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                flexShrink: 0,
                maxWidth: "180px",
            }}
        >
            <span style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}>
                {label}
            </span>

            {count !== undefined && (
                <span
                    style={{
                        background: active ? "rgba(255,255,255,0.25)" : "#f0ebe5",
                        color: active ? "#fff" : "#9e9185",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        lineHeight: 1.6,
                        flexShrink: 0,
                    }}
                >
                    {count}
                </span>
            )}
        </button>
    );
};