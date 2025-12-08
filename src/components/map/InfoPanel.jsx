import { Fragment } from "react";
import { X } from "lucide-react";

export default function InfoPanel({ open, onClose, selectedLT, toggleBreaker }) {
  if (!open || !selectedLT) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 20,
        top: 20,
        width: 320,
        background: "linear-gradient(180deg, #081028, #02101a)",
        padding: 20,
        borderRadius: 14,
        boxShadow: "0 8px 30px rgba(0,0,0,0.6), 0 0 30px rgba(0,150,255,0.06)",
        color: "#fff",
        zIndex: 9999,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{selectedLT.name}</h2>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, color: "#9fb4d8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          Circuit Breakers
        </h3>
        {selectedLT.breakers.map((breaker, idx) => (
          <div
            key={breaker.name}
            style={{
              background: "#061425",
              padding: 14,
              borderRadius: 10,
              marginBottom: 10,
              border: `2px solid ${breaker.status === "ON" ? "#198754" : "#dc3545"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{breaker.name}</span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  background: breaker.status === "ON" ? "#198754" : "#dc3545",
                }}
              >
                {breaker.status}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#9fb4d8", marginBottom: 4 }}>Voltage</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{breaker.voltage}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#9fb4d8", marginBottom: 4 }}>Current</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{breaker.current}</div>
              </div>
            </div>
            <button
              onClick={() => toggleBreaker(selectedLT.id, idx)}
              style={{
                width: "100%",
                padding: "8px",
                background: breaker.status === "ON" ? "#dc3545" : "#198754",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 12,
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {breaker.status === "ON" ? "TRIP" : "RESET"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

