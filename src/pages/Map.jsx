import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

// Lazy load MapComponent only on client side
const MapComponent = lazy(() => {
  if (typeof window === "undefined") {
    return Promise.resolve({ default: () => null });
  }
  return import("@/components/map/MapComponent");
});

export default function Map() {
  const navigate = useNavigate();
  const [showWarningsOnly, setShowWarningsOnly] = useState(false);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* Top Control Bar */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10000,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          style={{
            background: "linear-gradient(180deg, #081028, #02101a)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
          }}
        >
          <ArrowLeft size={16} style={{ marginRight: 8 }} />
          Back to Dashboard
        </Button>
        <Button
          onClick={() => setShowWarningsOnly(!showWarningsOnly)}
          variant={showWarningsOnly ? "default" : "outline"}
          style={{
            background: showWarningsOnly
              ? "linear-gradient(180deg, #ffc107, #ff9800)"
              : "linear-gradient(180deg, #081028, #02101a)",
            border: showWarningsOnly ? "none" : "1px solid rgba(255,255,255,0.2)",
            color: showWarningsOnly ? "#000" : "#fff",
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={16} style={{ marginRight: 8 }} />
          {showWarningsOnly ? "Show All" : "Show Warnings Only"}
        </Button>
      </div>

      {/* Map Component with warning filter prop */}
      <Suspense
        fallback={
          <div
            style={{
              height: "100vh",
              width: "100vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#020617",
              color: "#fff",
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>Loading Map...</div>
              <div style={{ fontSize: 14, color: "#9fb4d8" }}>Please wait</div>
            </div>
          </div>
        }
      >
        <MapComponent showWarningsOnly={showWarningsOnly} />
      </Suspense>
    </div>
  );
}

