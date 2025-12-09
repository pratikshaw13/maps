import React, { Fragment, useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import InfoPanel from "./InfoPanel";
import { AlertTriangle, Zap, Activity } from "lucide-react";

// Fix for default marker icons
import "leaflet/dist/leaflet.css";

function MapContent() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

/* ---------------------- Enhanced House Info Panel ---------------------- */
function HouseInfoPanel({ house, onClose, onToggle, onPhaseChange }) {
  if (!house) return null;

  const phaseColors = {
    R: { bg: "#dc3545", text: "#fff", label: "Red Phase" },
    Y: { bg: "#ffc107", text: "#000", label: "Yellow Phase" },
    B: { bg: "#0d6efd", text: "#fff", label: "Blue Phase" },
  };

  const phaseInfo = phaseColors[house.phase];
  const hasWarnings = house.warnings.length > 0;
  const voltageNum = parseInt(house.voltage.replace(" V", ""));
  const currentNum = parseFloat(house.current.replace(" A", ""));
  const isLowVoltage = voltageNum < 200;
  const isHighCurrent = currentNum > 20;

  return (
    <div
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
        width: 320,
        background: "linear-gradient(180deg, #081028, #02101a)",
        padding: 20,
        borderRadius: 14,
        boxShadow: "0 8px 30px rgba(0,0,0,0.6), 0 0 30px rgba(0,150,255,0.06)",
        color: "#fff",
        zIndex: 9999,
        fontFamily: "Inter, Arial, sans-serif",
        border: hasWarnings ? "2px solid #ffc107" : "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>House #{house.number}</h3>
          {house.lastPhaseChange && (
            <div style={{ fontSize: 11, color: "#9fb4d8", marginTop: 4 }}>
              Phase changed: {house.lastPhaseChange.toLocaleDateString()}
            </div>
          )}
        </div>
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
          ✕
        </button>
      </div>

      {/* Phase Indicator */}
      <div
        style={{
          background: phaseInfo.bg,
          color: phaseInfo.text,
          padding: 12,
          borderRadius: 10,
          marginBottom: 16,
          textAlign: "center",
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        {phaseInfo.label} ({house.phase})
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div
          style={{
            background: "#ffc10720",
            border: "1px solid #ffc107",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={16} color="#ffc107" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#ffc107" }}>Warnings</span>
          </div>
          {house.warnings.map((warning, idx) => (
            <div key={idx} style={{ fontSize: 12, color: "#ffc107", marginTop: 4 }}>
              • Load Limit Exceeded
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            background: "#061425",
            padding: 14,
            borderRadius: 10,
            textAlign: "center",
            border: isLowVoltage ? "2px solid #ffc107" : "none",
          }}
        >
          <div style={{ fontSize: 11, color: "#9fb4d8", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Zap size={12} />
            Voltage
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: isLowVoltage ? "#ffc107" : "#fff",
            }}
          >
            {house.voltage}
          </div>
        </div>
        <div
          style={{
            background: "#061425",
            padding: 14,
            borderRadius: 10,
            textAlign: "center",
            border: isHighCurrent ? "2px solid #dc3545" : "none",
          }}
        >
          <div style={{ fontSize: 11, color: "#9fb4d8", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Activity size={12} />
            Current
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: isHighCurrent ? "#dc3545" : "#fff",
            }}
          >
            {house.current}
          </div>
        </div>
      </div>

      {/* Power Consumption */}
      <div
        style={{
          background: "#061425",
          padding: 12,
          borderRadius: 10,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 11, color: "#9fb4d8", marginBottom: 6 }}>Power Consumption</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#4db8ff" }}>
          {house.powerConsumption.toFixed(2)} kW
        </div>
      </div>

      {/* Status and Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div
          style={{
            color: house.status === "ON" ? "#198754" : "#dc3545",
            fontWeight: 700,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: house.status === "ON" ? "#198754" : "#dc3545",
            }}
          />
          {house.status}
        </div>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={house.status === "ON"}
            onChange={() => onToggle(house)}
            style={{ width: 40, height: 20, cursor: "pointer" }}
          />
          <span style={{ fontSize: 12, color: "#bcd1ee" }}>{house.status === "ON" ? "ON" : "OFF"}</span>
        </label>
      </div>

      {/* Phase Change Buttons */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#9fb4d8", marginBottom: 8 }}>Change Phase:</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["R", "Y", "B"])
            .filter((p) => p !== house.phase)
            .map((phase) => (
              <button
                key={phase}
                onClick={() => onPhaseChange(house, phase)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: phaseColors[phase].bg,
                  color: phaseColors[phase].text,
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                → {phase}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Main Component ---------------------- */
export default function MapComponent({ showWarningsOnly = false }) {
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    // Delay to ensure React is fully initialized before rendering MapContainer
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const token = JSON.parse(localStorage.getItem("auth") || "{}")?.token || null;

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedLT, setSelectedLT] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [transformerPopup, setTransformerPopup] = useState({ show: false, ltId: null });

  // Fix default icons (client only)
  useEffect(() => {
    if (!isClient) return;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, [isClient]);

  // Icons (client-only)
  const substationIcon = useMemo(() => {
    if (!isClient) return null;
    return L.divIcon({
      className: "substation-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      html: `<div style="background:#0b2a40;color:#fff;padding:8px 10px;border-radius:8px;font-weight:700;font-size:14px;border:2px solid #4db8ff">SS</div>`,
    });
  }, [isClient]);

  const ltIcon = useMemo(() => {
    if (!isClient) return null;
    return L.divIcon({
      className: "lt-div-icon",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: `<div style="width:24px;height:24px;background:gold;border:2px solid orange;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">LT</div>`,
    });
  }, [isClient]);

  // Substation position
  const substationPosition = [10.8505, 76.2711];

  // LT nodes
  const [ltNodes, setLtNodes] = useState(() => {
    const manualLTPositions = {
      "LT-1": [10.9784, 76.3341],
      "LT-2": [10.9055, 76.4382],
      "LT-3": [10.7122, 76.3470],
      "LT-4": [10.6891, 76.2015],
      "LT-5": [10.7834, 76.1038],
      "LT-6": [10.9302, 76.1299],
    };

    return Array.from({ length: 6 }, (_, i) => {
      const id = `LT-${i + 1}`;
      return {
        id,
        name: id,
        position: manualLTPositions[id],
        breakers: [
          { name: `CB-${i + 1}-1`, voltage: "11 kV", current: "140 A", status: "ON" },
          { name: `CB-${i + 1}-2`, voltage: "13 kV", current: "160 A", status: "ON" },
          { name: `CB-${i + 1}-3`, voltage: "15 kV", current: "180 A", status: "ON" },
        ],
      };
    });
  });

  // Manual dots data
  const manualLTDots = useMemo(
    () => ({
      "LT-1": {
        0: [[10.992, 76.345], [11.005, 76.36], [11.018, 76.375], [11.0305, 76.3922], [11.045, 76.41]],
        1: [[10.979, 76.315], [10.9805, 76.29], [10.982, 76.26], [10.984, 76.225], [10.9865, 76.185]],
        2: [[11.0, 76.33], [11.02, 76.335], [11.04, 76.34], [11.06, 76.345], [11.08, 76.35]],
      },
      "LT-2": {
        0: [[10.93, 76.46], [10.947, 76.485], [10.963, 76.51], [10.9805, 76.535], [10.998, 76.56]],
        1: [[10.91, 76.46], [10.92, 76.48], [10.93, 76.5], [10.94, 76.52], [10.95, 76.54]],
        2: [[10.9, 76.45], [10.885, 76.465], [10.87, 76.478], [10.855, 76.492], [10.84, 76.505]],
      },
      "LT-3": {
        0: [[10.7125, 76.36], [10.7128, 76.375], [10.7132, 76.39], [10.7138, 76.405], [10.7145, 76.42]],
        1: [[10.7, 76.365], [10.685, 76.38], [10.67, 76.395], [10.655, 76.41], [10.64, 76.425]],
        2: [[10.7, 76.355], [10.683, 76.35], [10.666, 76.345], [10.649, 76.34], [10.632, 76.335]],
      },
      "LT-4": {
        0: [[10.675, 76.225], [10.655, 76.24], [10.635, 76.255], [10.615, 76.27], [10.595, 76.285]],
        1: [[10.67, 76.15], [10.655, 76.135], [10.64, 76.12], [10.625, 76.105], [10.61, 76.09]],
        2: [[10.68, 76.2], [10.66, 76.19], [10.64, 76.18], [10.62, 76.17], [10.6, 76.16]],
      },
      "LT-5": {
        0: [[10.78, 76.06], [10.77, 76.04], [10.76, 76.02], [10.75, 76.0], [10.74, 75.98]],
        1: [[10.8, 76.08], [10.815, 76.065], [10.83, 76.05], [10.845, 76.035]],
        2: [[10.76, 76.085], [10.745, 76.07], [10.73, 76.055], [10.715, 76.04], [10.7, 76.025]],
      },
      "LT-6": {
        0: [[10.95, 76.11], [10.965, 76.09], [10.98, 76.07], [11.0, 76.05], [11.02, 76.03]],
        1: [[10.905, 76.08], [10.89, 76.06], [10.875, 76.04], [10.86, 76.02], [10.845, 76.0]],
        2: [[10.955, 76.13], [10.975, 76.1295], [10.995, 76.129], [11.015, 76.1285], [11.035, 76.128]],
      },
    }),
    []
  );

  // Create segments LT -> dots
  const ltBranchLines = useMemo(() => {
    const segments = [];
    ltNodes.forEach((node) => {
      const [lat, lng] = node.position;
      for (let b = 0; b < 3; b++) {
        const dots = manualLTDots[node.id]?.[b] || [];
        segments.push({
          key: `${node.id}-${b}`,
          ltId: node.id,
          breakerIndex: b,
          positions: [[lat, lng], ...dots],
          dots,
        });
      }
    });
    return segments;
  }, [ltNodes, manualLTDots]);

  // Meters to degrees
  const metersToDeg = (meters, lat) => {
    const latDeg = meters / 111320;
    const lngDeg = meters / (111320 * Math.cos((lat * Math.PI) / 180));
    return [latDeg, lngDeg];
  };

  const randomHouseOffset = (lat, lng) => {
    const dist = Math.random() * 800 + 200; // 200-1000m
    const ang = Math.random() * Math.PI * 2;
    const [dLat, dLng] = metersToDeg(dist, lat);
    return [lat + Math.sin(ang) * dLat, lng + Math.cos(ang) * dLng];
  };

  // Generate houses with phase info and warnings
  const [housesMap, setHousesMap] = useState({});

  // Initialize houses when ltBranchLines is ready
  useEffect(() => {
    if (!isClient || ltBranchLines.length === 0) return;
    
    // Only initialize if housesMap is empty
    if (Object.keys(housesMap).length > 0) return;

    const result = {};
    const phases = ["R", "Y", "B"];
    
    // First, collect all houses to determine total count
    const allHouses = [];
    ltBranchLines.forEach((seg) => {
      seg.dots.forEach((dot) => {
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 houses per pole
        for (let i = 0; i < count; i++) {
          allHouses.push({ seg, dot });
        }
      });
    });
    
    // Select 2-3 random houses to have issues (except for LT-4 blue phase which will have 60% issues)
    const totalHouses = allHouses.length;
    const housesWithIssues = Math.min(3, Math.max(2, Math.floor(totalHouses * 0.1))); // 2-3 houses
    const issueIndices = new Set();
    while (issueIndices.size < housesWithIssues) {
      issueIndices.add(Math.floor(Math.random() * totalHouses));
    }

    // Generate houses with proper values
    // Phase assignment: breakerIndex 0 = R, 1 = Y, 2 = B
    const phaseMap = { 0: "R", 1: "Y", 2: "B" };
    let houseIndex = 0;
    
    ltBranchLines.forEach((seg) => {
      // Assign phase based on breakerIndex
      const phase = phaseMap[seg.breakerIndex];
      
      result[seg.key] = seg.dots.map((dot) => {
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 houses per pole
        return Array.from({ length: count }).map(() => {
          // For LT-4 blue phase, don't use the global issue indices (we'll handle it separately)
          const isLT4BluePhase = seg.ltId === "LT-4" && seg.breakerIndex === 2;
          const hasIssue = isLT4BluePhase ? false : issueIndices.has(houseIndex); // Skip for LT-4 blue, handle later
          houseIndex++;
          
          let voltageNum, currentNum;
          const warnings = [];
          
          if (hasIssue) {
            // Problematic house: low voltage OR high current (not both to keep it simple)
            if (Math.random() > 0.5) {
              // Low voltage issue
              voltageNum = Math.floor(Math.random() * 20) + 180; // 180-199
              currentNum = Math.random() * 7 + 10; // 10-17 (normal)
              warnings.push("Low voltage detected");
            } else {
              // High current issue
              voltageNum = Math.floor(Math.random() * 21) + 220; // 220-240 (normal)
              currentNum = Math.random() * 5 + 21; // 21-26 (high)
              warnings.push("High current draw");
            }
          } else {
            // Healthy house: good voltage and current
            voltageNum = Math.floor(Math.random() * 21) + 220; // 220-240
            currentNum = Math.random() * 7 + 10; // 10-17
          }

          return {
            id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9),
            position: randomHouseOffset(dot[0], dot[1]),
            voltage: `${voltageNum} V`,
            current: `${currentNum.toFixed(1)} A`,
            status: "ON",
            phase,
            powerConsumption: (voltageNum * currentNum) / 1000,
            warnings,
            number: 0, // will be assigned below
            connectedToPole: dot, // Store original pole connection
            connectedToHouse: null, // Will store connected house when phase changes
            segKey: seg.key, // Store segment key for reference
          };
        });
      });
    });

    // For LT-4 blue phase, make 60% of houses have issues
    const lt4BlueSegKey = "LT-4-2"; // LT-4, breakerIndex 2 (blue phase)
    if (result[lt4BlueSegKey]) {
      const allLT4BlueHouses = [];
      result[lt4BlueSegKey].forEach((arr) => {
        arr.forEach((house, houseIdx) => {
          allLT4BlueHouses.push({ arr, house, houseIdx });
        });
      });
      
      const lt4BlueIssuesCount = Math.ceil(allLT4BlueHouses.length * 0.6);
      const selectedIndices = new Set();
      while (selectedIndices.size < lt4BlueIssuesCount) {
        selectedIndices.add(Math.floor(Math.random() * allLT4BlueHouses.length));
      }
      
      // Update selected houses to have issues
      selectedIndices.forEach((idx) => {
        const { arr, houseIdx } = allLT4BlueHouses[idx];
        if (Math.random() > 0.5) {
          // Low voltage issue
          const voltageNum = Math.floor(Math.random() * 20) + 180; // 180-199
          const currentNum = Math.random() * 7 + 10; // 10-17 (normal)
          arr[houseIdx] = {
            ...arr[houseIdx],
            voltage: `${voltageNum} V`,
            current: `${currentNum.toFixed(1)} A`,
            powerConsumption: (voltageNum * currentNum) / 1000,
            warnings: ["Low voltage detected"],
          };
        } else {
          // High current issue
          const voltageNum = Math.floor(Math.random() * 21) + 220; // 220-240 (normal)
          const currentNum = Math.random() * 5 + 21; // 21-26 (high)
          arr[houseIdx] = {
            ...arr[houseIdx],
            voltage: `${voltageNum} V`,
            current: `${currentNum.toFixed(1)} A`,
            powerConsumption: (voltageNum * currentNum) / 1000,
            warnings: ["High current draw"],
          };
        }
      });
    }

    // Assign sequential numbers
    let cnt = 1;
    Object.keys(result).forEach((k) => {
      result[k].forEach((arr) => {
        arr.forEach((h) => {
          h.number = cnt++;
        });
      });
    });

    setHousesMap(result);
    // Only initialize once when ltBranchLines is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, ltBranchLines]);

  // Toggle house status
  const toggleHouse = (segKey, dotIdx, houseIdx) => {
    setHousesMap((prev) => {
      const copy = { ...prev };
      copy[segKey] = copy[segKey].map((arr, i) =>
        i === dotIdx
          ? arr.map((h, hi) => (hi === houseIdx ? { ...h, status: h.status === "ON" ? "OFF" : "ON" } : h))
          : arr
      );
      return copy;
    });

    const house = housesMap[segKey]?.[dotIdx]?.[houseIdx];
    if (house && selectedHouse?.id === house.id) {
      setSelectedHouse({ ...house, status: house.status === "ON" ? "OFF" : "ON" });
    }
  };

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Phase change handler - finds nearest pole of new phase and fixes the house
  const handlePhaseChange = (house, newPhase) => {
    const segKey = Object.keys(housesMap).find((k) =>
      housesMap[k].some((arr) => arr.some((h) => h.id === house.id))
    );
    if (!segKey) return;

    const dotIdx = housesMap[segKey].findIndex((arr) => arr.some((h) => h.id === house.id));
    const houseIdx = housesMap[segKey][dotIdx].findIndex((h) => h.id === house.id);

    // Find all poles (dots) of the new phase
    const phaseMap = { 0: "R", 1: "Y", 2: "B" };
    const polesOfNewPhase = [];
    
    ltBranchLines.forEach((seg) => {
      const segPhase = phaseMap[seg.breakerIndex];
      if (segPhase === newPhase) {
        seg.dots.forEach((dot, dotIndex) => {
          polesOfNewPhase.push({
            position: dot,
            segKey: seg.key,
            dotIndex: dotIndex,
          });
        });
      }
    });

    // Find nearest pole of the new phase
    let nearestPole = null;
    let minDistance = Infinity;
    const [houseLat, houseLng] = house.position;
    
    polesOfNewPhase.forEach(({ position }) => {
      const [pLat, pLng] = position;
      const distance = calculateDistance(houseLat, houseLng, pLat, pLng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPole = position;
      }
    });

    // Update house: change phase, fix issues, remove warnings, connect to nearest pole
    setHousesMap((prev) => {
      const copy = { ...prev };
      copy[segKey] = copy[segKey].map((arr, i) =>
        i === dotIdx
          ? arr.map((h, hi) => {
              if (hi === houseIdx) {
                // Fix the house: healthy voltage and current, no warnings, connect to nearest pole
                const healthyVoltage = Math.floor(Math.random() * 21) + 220; // 220-240
                const healthyCurrent = Math.random() * 7 + 10; // 10-17
                return {
                  ...h,
                  phase: newPhase,
                  voltage: `${healthyVoltage} V`,
                  current: `${healthyCurrent.toFixed(1)} A`,
                  powerConsumption: (healthyVoltage * healthyCurrent) / 1000,
                  warnings: [],
                  lastPhaseChange: new Date(),
                  connectedToPole: nearestPole, // Store connection to nearest pole of new phase
                  connectedToHouse: null, // Remove house connection
                };
              }
              return h;
            })
          : arr
      );
      return copy;
    });

    // Update selected house if it's the one being changed
    if (selectedHouse?.id === house.id) {
      const healthyVoltage = Math.floor(Math.random() * 21) + 220;
      const healthyCurrent = Math.random() * 7 + 10;
      setSelectedHouse({
        ...house,
        phase: newPhase,
        voltage: `${healthyVoltage} V`,
        current: `${healthyCurrent.toFixed(1)} A`,
        powerConsumption: (healthyVoltage * healthyCurrent) / 1000,
        warnings: [],
        lastPhaseChange: new Date(),
        connectedToPole: nearestPole,
        connectedToHouse: null,
      });
    }
  };

  // Toggle breaker
  async function toggleBreaker(ltId, breakerIndex) {
    setLtNodes((prev) =>
      prev.map((lt) => {
        if (lt.id !== ltId) return lt;
        return {
          ...lt,
          breakers: lt.breakers.map((b, i) => {
            if (i !== breakerIndex) return b;
            const newStatus = b.status === "ON" ? "OFF" : "ON";
            if (token) {
              fetch(`http://127.0.0.1:8000/api/control/${newStatus === "OFF" ? "TRIP" : "RESET"}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => {
                // Silently handle API errors
              });
            }
            return { ...b, status: newStatus };
          }),
        };
      })
    );
    setSelectedLT((prev) => {
      if (!prev || prev.id !== ltId) return prev;
      return {
        ...prev,
        breakers: prev.breakers.map((b, i) =>
          i === breakerIndex ? { ...b, status: b.status === "ON" ? "OFF" : "ON" } : b
        ),
      };
    });
  }

  // Auto fault trigger (runs once on mount)
  useEffect(() => {
    const triggered = localStorage.getItem("FAULT_TRIGGER");
    if (triggered === "YES") {
      localStorage.removeItem("FAULT_TRIGGER");
      const randomLT = Math.floor(Math.random() * ltNodes.length);
      const randomBreaker = Math.floor(Math.random() * 3);
      setLtNodes((prev) =>
        prev.map((lt, idx) =>
          idx !== randomLT
            ? lt
            : {
                ...lt,
                breakers: lt.breakers.map((b, j) => (j === randomBreaker ? { ...b, status: "OFF" } : b)),
              }
        )
      );
      if (token) {
        fetch(`http://127.0.0.1:8000/api/control/TRIP`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {
          // Silently handle API errors
        });
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase colors for visualization
  const phaseColors = {
    R: "#dc3545",
    Y: "#ffc107",
    B: "#0d6efd",
  };

  // Animation state for color-changing warnings
  const [warningAnimation, setWarningAnimation] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setWarningAnimation((prev) => (prev + 1) % 4);
    }, 500); // Change color every 500ms
    return () => clearInterval(interval);
  }, []);

  // Warning colors that cycle
  const warningColors = ["#ffc107", "#ff9800", "#ff5722", "#f44336"];
  const currentWarningColor = warningColors[warningAnimation];

  // Check if all three phases from an LT box have faults, or if LT-4 blue phase has 60% faults
  useEffect(() => {
    if (!isClient || Object.keys(housesMap).length === 0) return;

    ltNodes.forEach((lt) => {
      // Special case for LT-4: Check if blue phase has 60% faults
      if (lt.id === "LT-4") {
        const bluePhaseSegKey = "LT-4-2"; // Blue phase is breakerIndex 2
        const bluePhaseHouses = housesMap[bluePhaseSegKey];
        
        if (bluePhaseHouses) {
          let totalBlueHouses = 0;
          let faultyBlueHouses = 0;
          
          bluePhaseHouses.forEach((arr) => {
            arr.forEach((house) => {
              totalBlueHouses++;
              if (house.warnings.length > 0 && house.status === "ON") {
                faultyBlueHouses++;
              }
            });
          });
          
          // If 60% or more of blue phase houses have faults, show popup
          if (totalBlueHouses > 0 && (faultyBlueHouses / totalBlueHouses) >= 0.6) {
            if (transformerPopup.ltId !== lt.id) {
              setTransformerPopup({ show: true, ltId: lt.id });
              return; // Don't check other conditions for LT-4
            }
          }
        }
      }
      
      // Check all three breakers (phases) for this LT
      let allPhasesHaveFaults = true;

      for (let breakerIndex = 0; breakerIndex < 3; breakerIndex++) {
        const segKey = `${lt.id}-${breakerIndex}`;
        const houses = housesMap[segKey];
        
        if (!houses) {
          allPhasesHaveFaults = false;
          break;
        }

        // Check if at least one house in this phase has warnings
        let phaseHasFault = false;
        houses.forEach((arr) => {
          arr.forEach((house) => {
            if (house.warnings.length > 0 && house.status === "ON") {
              phaseHasFault = true;
            }
          });
        });

        if (!phaseHasFault) {
          allPhasesHaveFaults = false;
          break;
        }
      }

      // Show popup if all phases have faults and popup not already shown for this LT
      if (allPhasesHaveFaults && transformerPopup.ltId !== lt.id) {
        setTransformerPopup({ show: true, ltId: lt.id });
      }
    });
  }, [housesMap, ltNodes, isClient, transformerPopup]);

  // Don't render map until client is ready, mounted, and houses are initialized
  if (!isClient || !isMounted || Object.keys(housesMap).length === 0) {
    return (
      <div style={{ 
        height: "100vh", 
        width: "100vw", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#020617",
        color: "#fff",
        fontFamily: "Inter, Arial, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Loading Map...</div>
          <div style={{ fontSize: 14, color: "#9fb4d8" }}>Initializing components</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", backgroundColor: "#020617" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
            center={[10.8505, 76.2711]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <MapContent />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Substation */}
            {substationIcon && <Marker position={substationPosition} icon={substationIcon} />}

            {/* LT nodes */}
            {ltIcon && ltNodes.map((node) => {
              // Check if all three phases from this LT have faults
              let allPhasesHaveFaults = false;
              if (Object.keys(housesMap).length > 0) {
                allPhasesHaveFaults = true;
                for (let breakerIndex = 0; breakerIndex < 3; breakerIndex++) {
                  const segKey = `${node.id}-${breakerIndex}`;
                  const houses = housesMap[segKey];
                  
                  if (!houses) {
                    allPhasesHaveFaults = false;
                    break;
                  }

                  let phaseHasFault = false;
                  houses.forEach((arr) => {
                    arr.forEach((house) => {
                      if (house.warnings.length > 0 && house.status === "ON") {
                        phaseHasFault = true;
                      }
                    });
                  });

                  if (!phaseHasFault) {
                    allPhasesHaveFaults = false;
                    break;
                  }
                }
              }

              return (
                <Fragment key={node.id}>
                  <Marker
                    position={node.position}
                    icon={ltIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedLT(node);
                        setPanelOpen(true);
                      },
                    }}
                  />
                  <Polyline
                    positions={[substationPosition, node.position]}
                    pathOptions={{ color: "#198754", weight: 4 }}
                  />
                  {/* Transformer Addition Button - appears when all phases have faults */}
                  {allPhasesHaveFaults && (
                    <Marker
                      position={[node.position[0] + 0.002, node.position[1] + 0.002]}
                      icon={L.divIcon({
                        className: "transformer-add-icon",
                        html: `
                          <div style="
                            background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
                            padding: 8px 12px;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
                            border: 2px solid #fff;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            font-size: 11px;
                            font-weight: 700;
                            color: #fff;
                            white-space: nowrap;
                            animation: pulse-transformer 2s ease-in-out infinite;
                          ">
                            ⚡ Add Transformer
                          </div>
                          <style>
                            @keyframes pulse-transformer {
                              0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4); }
                              50% { transform: scale(1.05); box-shadow: 0 6px 16px rgba(255, 107, 107, 0.6); }
                            }
                          </style>
                        `,
                        iconSize: [120, 32],
                        iconAnchor: [60, 16],
                      })}
                      eventHandlers={{
                        click: () => {
                          // Fix all houses for this LT box
                          setHousesMap((prev) => {
                            const copy = { ...prev };
                            for (let breakerIndex = 0; breakerIndex < 3; breakerIndex++) {
                              const segKey = `${node.id}-${breakerIndex}`;
                              if (copy[segKey]) {
                                copy[segKey] = copy[segKey].map((arr) =>
                                  arr.map((house) => {
                                    if (house.warnings.length > 0) {
                                      // Fix the house: healthy voltage and current, no warnings
                                      const healthyVoltage = Math.floor(Math.random() * 21) + 220; // 220-240
                                      const healthyCurrent = Math.random() * 7 + 10; // 10-17
                                      return {
                                        ...house,
                                        voltage: `${healthyVoltage} V`,
                                        current: `${healthyCurrent.toFixed(1)} A`,
                                        powerConsumption: (healthyVoltage * healthyCurrent) / 1000,
                                        warnings: [],
                                      };
                                    }
                                    return house;
                                  })
                                );
                              }
                            }
                            return copy;
                          });
                        },
                      }}
                    />
                  )}
                </Fragment>
              );
            })}

            {/* Branches, poles, houses */}
            {ltBranchLines.map((seg) => {
              const lt = ltNodes.find((n) => n.id === seg.ltId);
              const breakerStatus = lt?.breakers[seg.breakerIndex].status || "ON";
              // Phase mapping: 0=R, 1=Y, 2=B
              const phaseMap = { 0: "R", 1: "Y", 2: "B" };
              const phase = phaseMap[seg.breakerIndex];
              const phaseColor = phaseColors[phase];

              return (
                <Fragment key={seg.key}>
                  <Polyline
                    positions={seg.positions}
                    pathOptions={{
                      color: breakerStatus === "ON" ? phaseColor : "#dc3545",
                      weight: 2.5,
                      opacity: 0.8,
                    }}
                  />
                  {seg.dots.map((dot, dotIdx) => (
                    <Fragment key={`${seg.key}-dot-${dotIdx}`}>
                      <CircleMarker
                        center={dot}
                        radius={4}
                        pathOptions={{
                          color: breakerStatus === "ON" ? phaseColor : "#dc3545",
                          fillColor: "#fff",
                          fillOpacity: 0.9,
                          weight: 2,
                        }}
                      />

                      {/* Houses for this pole */}
                      {(housesMap[seg.key]?.[dotIdx] || [])
                        .filter((house) => {
                          if (showWarningsOnly) {
                            return house.warnings.length > 0;
                          }
                          return true;
                        })
                        .map((house, hIdx) => {
                          const { position, status, number, phase, warnings } = house;
                          const hasWarnings = warnings.length > 0;
                          const phaseColor = phaseColors[phase];

                          // Create house icon with phase color and animated warning indicator
                          const icon = L.divIcon({
                            className: "custom-house-icon",
                            html: `
                              <div style="
                                width:${hasWarnings ? "28" : "24"}px;height:${hasWarnings ? "28" : "24"}px;
                                background:${status === "ON" ? phaseColor : "#666"};
                                border:${hasWarnings ? "3" : "2"}px solid ${hasWarnings ? currentWarningColor : status === "ON" ? "#fff" : "#999"};
                                border-radius:50%;
                                display:flex;align-items:center;justify-content:center;
                                font-size:10px;font-weight:700;color:${phase === "Y" ? "#000" : "#fff"};
                                box-sizing:border-box;
                                box-shadow:${hasWarnings ? `0 0 15px ${currentWarningColor}, 0 0 25px ${currentWarningColor}40` : "none"};
                                position:relative;
                                animation:${hasWarnings ? "pulse-warning 1s ease-in-out infinite" : "none"};
                                transition:all 0.3s ease;
                              ">
                                ${number}
                                ${hasWarnings ? `<span style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;background:${currentWarningColor};border-radius:50%;border:2px solid #fff;animation:pulse-dot 1s ease-in-out infinite;"></span>` : ""}
                              </div>
                              <style>
                                @keyframes pulse-warning {
                                  0%, 100% { transform: scale(1); box-shadow: 0 0 15px ${currentWarningColor}, 0 0 25px ${currentWarningColor}40; }
                                  50% { transform: scale(1.1); box-shadow: 0 0 20px ${currentWarningColor}, 0 0 35px ${currentWarningColor}60; }
                                }
                                @keyframes pulse-dot {
                                  0%, 100% { transform: scale(1); opacity: 1; }
                                  50% { transform: scale(1.3); opacity: 0.7; }
                                }
                              </style>
                            `,
                            iconSize: hasWarnings ? [28, 28] : [24, 24],
                            iconAnchor: hasWarnings ? [14, 14] : [12, 12],
                          });

                          // Use connected pole if phase was changed, otherwise use original pole
                          const connectionPole = house.connectedToPole || dot;

                          return (
                            <Fragment key={house.id}>
                              {/* Connection line: to nearest pole of new phase if phase changed, otherwise to original pole */}
                              <Polyline
                                positions={[connectionPole, position]}
                                pathOptions={{
                                  color: hasWarnings ? currentWarningColor : status === "ON" ? phaseColor : "#666",
                                  weight: hasWarnings ? 2.5 : 1.5,
                                  opacity: hasWarnings ? 0.9 : 0.7,
                                  dashArray: house.connectedToPole ? "8, 4" : "5, 5", // Different dash pattern for phase-changed connections
                                }}
                              />
                            <Marker
                              key={`${house.id}-${warningAnimation}`}
                              position={position}
                              icon={icon}
                              eventHandlers={{
                                click: () => setSelectedHouse(house),
                              }}
                            />
                              {/* Enhanced warning marker with color-changing animation */}
                              {hasWarnings && (
                                <Marker
                                  key={`${house.id}-warning-${warningAnimation}`}
                                  position={[position[0] + 0.0015, position[1] + 0.0015]}
                                  icon={L.divIcon({
                                    className: "warning-icon",
                                    html: `<div style="
                                      width:20px;height:20px;
                                      background:${currentWarningColor};
                                      border:2px solid #fff;
                                      border-radius:50%;
                                      display:flex;align-items:center;justify-content:center;
                                      font-size:12px;font-weight:700;color:#000;
                                      box-shadow:0 0 12px ${currentWarningColor}, 0 0 20px ${currentWarningColor}60;
                                      animation:pulse-warning-icon 1s ease-in-out infinite;
                                    ">⚠</div>
                                    <style>
                                      @keyframes pulse-warning-icon {
                                        0%, 100% { transform: scale(1); box-shadow: 0 0 12px ${currentWarningColor}, 0 0 20px ${currentWarningColor}60; }
                                        50% { transform: scale(1.2); box-shadow: 0 0 18px ${currentWarningColor}, 0 0 30px ${currentWarningColor}80; }
                                      }
                                    </style>`,
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10],
                                  })}
                                />
                              )}
                            </Fragment>
                          );
                        })}
                    </Fragment>
                  ))}
                </Fragment>
              );
            })}
          </MapContainer>
        </div>

      {/* LT Info Panel */}
      <InfoPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        selectedLT={selectedLT}
        toggleBreaker={toggleBreaker}
      />

      {/* House Info Panel */}
      <HouseInfoPanel
        house={selectedHouse}
        onClose={() => setSelectedHouse(null)}
        onToggle={(house) => {
          const segKey = Object.keys(housesMap).find((k) =>
            housesMap[k].some((arr) => arr.some((h) => h.id === house.id))
          );
          if (!segKey) return;
          const dotIdx = housesMap[segKey].findIndex((arr) => arr.some((h) => h.id === house.id));
          const houseIdx = housesMap[segKey][dotIdx].findIndex((h) => h.id === house.id);
          toggleHouse(segKey, dotIdx, houseIdx);
        }}
        onPhaseChange={handlePhaseChange}
      />

      {/* Transformer Addition Popup */}
      {transformerPopup.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #081028, #02101a)",
              padding: 30,
              borderRadius: 16,
              maxWidth: 500,
              width: "90%",
              boxShadow: "0 8px 30px rgba(0,0,0,0.6), 0 0 30px rgba(0,150,255,0.1)",
              border: "2px solid #4db8ff",
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              ⚠️ Critical Alert
            </h2>
            <p style={{ margin: "0 0 20px 0", fontSize: 16, color: "#bcd1ee", lineHeight: 1.6 }}>
              All three phases (R, Y, B) from <strong style={{ color: "#4db8ff" }}>{transformerPopup.ltId}</strong> are experiencing faults.
              This indicates overload conditions across all phases.
            </p>
            <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "#9fb4d8", lineHeight: 1.6 }}>
              <strong>Recommendation:</strong> Add an extra transformer in parallel to meet the increased demand and balance the load.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setTransformerPopup({ show: false, ltId: null })}
                style={{
                  padding: "12px 24px",
                  background: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                No, Later
              </button>
              <button
                onClick={() => {
                  // Fix all houses for this LT box
                  const ltId = transformerPopup.ltId;
                  setHousesMap((prev) => {
                    const copy = { ...prev };
                    for (let breakerIndex = 0; breakerIndex < 3; breakerIndex++) {
                      const segKey = `${ltId}-${breakerIndex}`;
                      if (copy[segKey]) {
                        copy[segKey] = copy[segKey].map((arr) =>
                          arr.map((house) => {
                            if (house.warnings.length > 0) {
                              // Fix the house: healthy voltage and current, no warnings
                              const healthyVoltage = Math.floor(Math.random() * 21) + 220; // 220-240
                              const healthyCurrent = Math.random() * 7 + 10; // 10-17
                              return {
                                ...house,
                                voltage: `${healthyVoltage} V`,
                                current: `${healthyCurrent.toFixed(1)} A`,
                                powerConsumption: (healthyVoltage * healthyCurrent) / 1000,
                                warnings: [],
                              };
                            }
                            return house;
                          })
                        );
                      }
                    }
                    return copy;
                  });
                  setTransformerPopup({ show: false, ltId: null });
                }}
                style={{
                  padding: "12px 24px",
                  background: "#198754",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Yes, Add Transformer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

