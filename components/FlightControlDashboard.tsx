"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the map to ensure client-only canvas rendering
const DroneMap = dynamic(() => import("./DroneMap"), { ssr: false });

// ─── Types ──────────────────────────────────────────────────────────────────
interface Waypoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

interface Alert {
  id: number;
  message: string;
  level: "critical" | "warning" | "info";
  time: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const INITIAL_WAYPOINTS: Waypoint[] = [
  { id: "wp-a", label: "A", lat: 28.6139, lng: 77.2090 },
  { id: "wp-b", label: "B", lat: 28.6155, lng: 77.2120 },
  { id: "wp-c", label: "C", lat: 28.6170, lng: 77.2100 },
  { id: "wp-d", label: "D", lat: 28.6180, lng: 77.2075 },
  { id: "wp-e", label: "E", lat: 28.6160, lng: 77.2055 },
];

const MOCK_ALERTS: Alert[] = [
  { id: 1, message: "Low battery warning (22%)", level: "critical", time: "2m ago" },
  { id: 2, message: "High wind detected (18 km/h)", level: "warning", time: "5m ago" },
  { id: 3, message: "GPS signal weak in Zone 3", level: "warning", time: "8m ago" },
  { id: 4, message: "Mission completed — Field 5", level: "info", time: "12m ago" },
];

const DRONE_MODES = ["AUTO", "MANUAL", "RTL", "GUIDED"];

// ─── Glowing Card wrapper ─────────────────────────────────────────────────
const GlassCard = ({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) => (
  <div
    className={`relative rounded-2xl border border-green-500/20 bg-black/60 backdrop-blur-md p-5 ${glow ? "shadow-[0_0_24px_2px_rgba(34,197,94,0.18)]" : ""
      } ${className}`}
  >
    {children}
  </div>
);

// ─── Section heading ──────────────────────────────────────────────────────
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-green-400 mb-1 flex items-center gap-2">
    <span className="inline-block w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_2px_rgba(34,197,94,0.8)]" />
    {children}
  </h2>
);

// ─── Neon button variants ────────────────────────────────────────────────
const NeonButton = ({
  children,
  onClick,
  variant = "green",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "green" | "red" | "ghost";
  className?: string;
}) => {
  const base =
    "relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer select-none";
  const variants = {
    green:
      "bg-green-500/10 text-green-300 border border-green-500/40 hover:bg-green-500/25 hover:shadow-[0_0_16px_2px_rgba(34,197,94,0.5)] hover:border-green-400",
    red: "bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/30 hover:shadow-[0_0_20px_4px_rgba(239,68,68,0.6)] hover:border-red-400",
    ghost:
      "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1A — Mission Planner
// ────────────────────────────────────────────────────────────────────────────
const MissionPlanner = ({
  waypoints,
  onAddWaypoint,
}: {
  waypoints: Waypoint[];
  onAddWaypoint: () => void;
}) => {
  const [altitude, setAltitude] = useState(50);
  const [spray, setSpray] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <GlassCard glow className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <SectionTitle>Mission Planner</SectionTitle>
        <span className="text-[10px] text-green-400/60 font-mono">PLAN-{waypoints.length} WP</span>
      </div>

      {/* Waypoint list */}
      <div className="flex-1 space-y-1.5 overflow-y-auto max-h-48 pr-1">
        {waypoints.map((wp, i) => (
          <div
            key={wp.id}
            className="flex items-center gap-3 bg-green-500/5 border border-green-500/15 rounded-xl px-3 py-2"
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500/20 text-green-400 text-xs font-bold shrink-0">
              {wp.label}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 font-mono truncate">
                {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
              </p>
            </div>
            <span className="text-[10px] text-green-400/50 font-mono">WP-{i + 1}</span>
          </div>
        ))}
      </div>

      <NeonButton variant="ghost" className="w-full text-center" onClick={onAddWaypoint}>
        + Add Waypoint
      </NeonButton>

      {/* Altitude slider */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Mission Altitude</span>
          <span className="text-green-400 font-mono">{altitude} m</span>
        </div>
        <input
          type="range"
          min={10}
          max={200}
          value={altitude}
          onChange={(e) => setAltitude(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-green-500 bg-green-500/20"
        />
      </div>

      {/* Spray toggle */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
        <span className="text-sm text-gray-300 font-medium">Spray System</span>
        <button
          onClick={() => setSpray(!spray)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${spray ? "bg-green-500" : "bg-white/20"
            }`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${spray ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </button>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <NeonButton variant="ghost" className="w-full" onClick={handleSave}>
          {saved ? "✓ Mission Saved" : "Save Mission"}
        </NeonButton>
        <NeonButton
          variant="green"
          className="w-full text-center shadow-[0_0_20px_2px_rgba(34,197,94,0.3)]"
        >
          Send Mission to Drone 🚀
        </NeonButton>
      </div>
    </GlassCard>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1C — Telemetry Panel
// ────────────────────────────────────────────────────────────────────────────
const TelemetryPanel = () => {
  const [battery, setBattery] = useState(72);
  const [altitude, setAltitude] = useState(34.5);
  const [speed, setSpeed] = useState(3.2);
  const [signal, setSignal] = useState(4);
  const [wind, setWind] = useState(6.8);
  const [modeIdx, setModeIdx] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBattery((v) => Math.max(5, +(v - Math.random() * 0.3).toFixed(1)));
      setAltitude((v) => +(v + (Math.random() - 0.5) * 0.8).toFixed(1));
      setSpeed((v) => Math.max(0, +(v + (Math.random() - 0.5) * 0.5).toFixed(1)));
      setSignal(Math.floor(Math.random() * 2) + 3);
      setWind((v) => Math.max(0, +(v + (Math.random() - 0.5) * 1.5).toFixed(1)));
      setTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // cycle mode every 10 ticks
  useEffect(() => {
    if (tick % 10 === 0 && tick > 0) setModeIdx((i) => (i + 1) % DRONE_MODES.length);
  }, [tick]);

  const mode = DRONE_MODES[modeIdx];
  const modeColor =
    mode === "RTL"
      ? "text-red-400 border-red-500/40 bg-red-500/10"
      : mode === "MANUAL"
        ? "text-yellow-400 border-yellow-500/40 bg-yellow-500/10"
        : "text-green-400 border-green-500/40 bg-green-500/10";

  const battColor =
    battery > 50 ? "bg-green-500" : battery > 20 ? "bg-yellow-500" : "bg-red-500";

  const SignalBars = ({ strength }: { strength: number }) => (
    <div className="flex items-end gap-0.5 h-5">
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className={`w-2 rounded-sm transition-all duration-500 ${bar <= strength ? "bg-green-400" : "bg-green-400/15"
            }`}
          style={{ height: `${bar * 4}px` }}
        />
      ))}
    </div>
  );

  return (
    <GlassCard glow className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <SectionTitle>Live Telemetry</SectionTitle>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${modeColor}`}>
          {mode}
        </span>
      </div>

      {/* Battery */}
      <div className="bg-white/5 rounded-xl p-3">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-400">Battery</span>
          <span className={`font-mono font-bold ${battery < 20 ? "text-red-400" : "text-green-400"}`}>
            {battery.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${battColor} shadow-[0_0_8px_2px_rgba(34,197,94,0.4)]`}
            style={{ width: `${battery}%` }}
          />
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Altitude", value: `${altitude.toFixed(1)}`, unit: "m" },
          { label: "Speed", value: `${speed.toFixed(1)}`, unit: "m/s" },
          { label: "Wind Speed", value: `${wind.toFixed(1)}`, unit: "km/h" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-white/5 border border-green-500/10 rounded-xl p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-lg font-bold text-green-400 font-mono leading-none">
              {value}
              <span className="text-xs text-gray-500 ml-1 font-normal">{unit}</span>
            </p>
          </div>
        ))}

        {/* Signal */}
        <div className="bg-white/5 border border-green-500/10 rounded-xl p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Signal</p>
          <SignalBars strength={signal} />
        </div>
      </div>

      {/* Animated pulse indicator */}
      <div className="flex items-center gap-2 mt-auto">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[11px] text-green-400/60 font-mono">LIVE · upd every 2s</span>
      </div>
    </GlassCard>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2A — Drone Controls
// ────────────────────────────────────────────────────────────────────────────
const DroneControls = () => {
  const [activeCmd, setActiveCmd] = useState<string | null>(null);

  const sendCmd = (cmd: string) => {
    setActiveCmd(cmd);
    setTimeout(() => setActiveCmd(null), 1500);
  };

  return (
    <GlassCard className="flex flex-col gap-4">
      <SectionTitle>Drone Controls</SectionTitle>
      {activeCmd && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2 text-green-400 text-xs font-mono animate-pulse">
          ▶ Executing: {activeCmd}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {["Take Off", "Land", "Pause Mission", "Resume Mission", "Return Home"].map((cmd) => (
          <NeonButton key={cmd} variant="green" onClick={() => sendCmd(cmd)}>
            {cmd}
          </NeonButton>
        ))}
        <NeonButton
          variant="red"
          className="col-span-2 sm:col-span-1 shadow-[0_0_24px_4px_rgba(239,68,68,0.35)] animate-pulse"
          onClick={() => sendCmd("EMERGENCY STOP")}
        >
          ⚠ Emergency Stop
        </NeonButton>
      </div>
    </GlassCard>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2B — Live Camera Feed
// ────────────────────────────────────────────────────────────────────────────
const CameraFeed = () => (
  <GlassCard className="flex flex-col gap-3">
    <SectionTitle>Live Camera Feed</SectionTitle>
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-green-500/20">
      {/* Animated scan lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-full h-px bg-green-400/5" />
        ))}
      </div>
      {/* Moving scan line */}
      <div
        className="absolute w-full h-0.5 bg-green-400/30 animate-bounce"
        style={{ animationDuration: "3s" }}
      />
      {/* HUD elements */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        <div className="flex justify-between">
          <span className="text-green-400 text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded">
            CAM-1 · NADIR
          </span>
          <span className="flex items-center gap-1 text-red-400 text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            REC
          </span>
        </div>
        {/* Cross-hair */}
        <div className="flex items-center justify-center flex-1">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border border-green-400/40 rounded-full" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-green-400/40" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-green-400/40" />
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-green-400/60 text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded">
            ALT 34m
          </span>
          <span className="text-green-400/60 text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded">
            FOV 84°
          </span>
        </div>
      </div>
    </div>
    <p className="text-center text-xs text-gray-500 font-mono">Live Drone Camera Feed</p>
  </GlassCard>
);

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2C — Flight Alerts
// ────────────────────────────────────────────────────────────────────────────
const FlightAlerts = () => {
  const alertStyle: Record<Alert["level"], string> = {
    critical:
      "border-red-500/40 bg-red-500/8 shadow-[0_0_12px_1px_rgba(239,68,68,0.2)]",
    warning: "border-orange-500/40 bg-orange-500/8 shadow-[0_0_12px_1px_rgba(249,115,22,0.2)]",
    info: "border-green-500/30 bg-green-500/8",
  };
  const alertTextStyle: Record<Alert["level"], string> = {
    critical: "text-red-400",
    warning: "text-orange-400",
    info: "text-green-400",
  };
  const alertIcon: Record<Alert["level"], string> = {
    critical: "🚨",
    warning: "⚠️",
    info: "✅",
  };

  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionTitle>Flight Alerts</SectionTitle>
        <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
          {MOCK_ALERTS.filter((a) => a.level === "critical").length} critical
        </span>
      </div>
      <div className="space-y-2">
        {MOCK_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-2 border rounded-xl px-3 py-2.5 ${alertStyle[alert.level]}`}
          >
            <span className="text-base shrink-0">{alertIcon[alert.level]}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${alertTextStyle[alert.level]}`}>
                {alert.message}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SECTION 3 — AI Mission Assistant
// ────────────────────────────────────────────────────────────────────────────
const AIMissionAssistant = () => {
  const [generating, setGenerating] = useState(false);

  const suggestions = [
    {
      field: "Field 7",
      suggestion:
        "High pest activity detected in Field 7. Aphid concentration above threshold in eastern sector. We recommend deploying a targeted spray mission at 40m altitude.",
    },
    {
      field: "Field 3",
      suggestion:
        "Soil moisture deficit detected in Field 3 (NW quadrant). Irrigation drone mission suggested at low altitude pass with moisture sensoring.",
    },
    {
      field: "Field 12",
      suggestion:
        "Early blight detected via satellite imagery in Field 12. Recommend drone scouting mission for ground truth verification before treatment.",
    },
  ];

  const [suggIdx, setSuggIdx] = useState(0);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setSuggIdx((i) => (i + 1) % suggestions.length);
    }, 1800);
  };

  const current = suggestions[suggIdx];

  return (
    <GlassCard glow className="col-span-full">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <SectionTitle>AI Mission Suggestions</SectionTitle>
          <p className="text-[11px] text-green-400/50 font-mono mb-3">
            Powered by AgroSentry AI Engine
          </p>
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400 text-base">🤖</span>
              <span className="text-xs text-green-400 font-semibold">{current.field} Alert</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{current.suggestion}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:min-w-[220px]">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xl font-bold text-green-400 font-mono">3</p>
              <p className="text-[10px] text-gray-500 mt-1">Active Alerts</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xl font-bold text-yellow-400 font-mono">7</p>
              <p className="text-[10px] text-gray-500 mt-1">Fields Monitored</p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="relative w-full px-4 py-3 rounded-xl font-semibold text-sm bg-green-500/15 text-green-300 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_24px_4px_rgba(34,197,94,0.5)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating...
              </span>
            ) : (
              "👉 Generate AI Mission"
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────────────
export function FlightControlDashboard() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);

  const addWaypoint = () => {
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nextLabel = labels[waypoints.length % labels.length];
    const last = waypoints[waypoints.length - 1];
    setWaypoints([
      ...waypoints,
      {
        id: `wp-${Date.now()}`,
        label: nextLabel,
        lat: last.lat + (Math.random() - 0.5) * 0.002,
        lng: last.lng + (Math.random() - 0.5) * 0.003,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 md:px-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            
            <span>
              Flight{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                Control
              </span>
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Drone Mission Control Center · AgroSentry</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-xs font-semibold">DRONE ONLINE</span>
          </div>
        </div>
      </div>

      {/* SECTION 1 — Mission Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Mission Planner */}
        <div className="lg:col-span-1">
          <MissionPlanner waypoints={waypoints} onAddWaypoint={addWaypoint} />
        </div>

        {/* Live Drone Map */}
        <div className="lg:col-span-1">
          <GlassCard glow className="h-full min-h-[480px] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionTitle>Live Drone Map</SectionTitle>
              <div className="flex gap-2">
                <button className="text-[10px] border border-green-500/30 text-green-400/70 rounded-lg px-2 py-1 hover:bg-green-500/10 transition-colors">
                  Satellite
                </button>
                <button className="text-[10px] border border-white/10 text-gray-500 rounded-lg px-2 py-1 hover:bg-white/5 transition-colors">
                  Terrain
                </button>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-green-500/20 relative min-h-[380px]">
              <DroneMap waypoints={waypoints} />
              {/* Return Home overlay */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000]">
                <button className="bg-black/80 backdrop-blur border border-green-500/50 text-green-400 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-green-500/20 hover:shadow-[0_0_16px_2px_rgba(34,197,94,0.4)] transition-all">
                  🏠 Return Home
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Telemetry */}
        <div className="lg:col-span-1">
          <TelemetryPanel />
        </div>
      </div>

      {/* SECTION 2 — Drone Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DroneControls />
        <CameraFeed />
        <FlightAlerts />
      </div>

      {/* SECTION 3 — AI Mission Assistant */}
      <div className="grid grid-cols-1 gap-4">
        <AIMissionAssistant />
      </div>
    </div>
  );
}
