import { useState, useEffect, useRef, useMemo } from "react";
import { Terminal, Pause, Play, Trash2, Activity } from "lucide-react";

function formatWibClock(isoString) {
  if (!isoString) return "--:--:--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(isoString));
}

export default function SerialMonitorCard({
  serialLogs = [],
  device,
  onClear,
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [showHeartbeat, setShowHeartbeat] = useState(true);
  const [frozenLogs, setFrozenLogs] = useState([]);
  const terminalRef = useRef(null);

  const visibleLogs = useMemo(() => {
    const source = isPaused ? frozenLogs : serialLogs;
    return showHeartbeat ? source : source.filter((item) => !item.isHeartbeat);
  }, [isPaused, frozenLogs, serialLogs, showHeartbeat]);

  // Auto-scroll hanya di dalam kotak terminal agar scroll halaman tidak terganggu
  useEffect(() => {
    if (!isPaused && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLogs, isPaused]);

  const handleTogglePause = () => {
    if (!isPaused) {
      setFrozenLogs(serialLogs);
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  };

  const isOnline =
    device?.last_seen && Date.now() - new Date(device.last_seen).getTime() < 45000;

  return (
    <section className="bg-obsidian border border-ice/20 rounded-lg p-5 md:p-6 flex flex-col gap-4">
      {/* Header Terminal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-ice/15">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-surface-low border border-ice/20 text-ice">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-ice-text">
                Serial Monitor Real-time
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-ice/10 border border-ice/30 font-mono text-[10px] text-ice">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline && !isPaused ? "bg-ice animate-pulse" : "bg-ice-muted/60"
                  }`}
                />
                {isPaused ? "PAUSED" : isOnline ? "LIVE_STREAM" : "IDLE"}
              </span>
            </div>
            <p className="font-mono text-[11px] text-ice-muted">
              USB_CDC / CLOUD_UART • {device?.id || "esp32-c3-01"} • 115200 baud (WIB)
            </p>
          </div>
        </div>

        {/* Kontrol Terminal */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setShowHeartbeat((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-colors cursor-pointer ${
              showHeartbeat
                ? "bg-ice/15 border-ice/40 text-ice"
                : "bg-surface-low border-ice/20 text-ice-muted hover:text-ice-light"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Heartbeat: {showHeartbeat ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePause}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-surface-low border border-ice/25 hover:border-ice/50 text-ice-text transition-colors cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-ice" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-ice" />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setFrozenLogs([]);
              onClear?.();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-surface-low border border-ice/25 hover:border-ice/50 text-ice-muted hover:text-ice-light transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Console Output Box */}
      <div
        ref={terminalRef}
        className="w-full h-64 overflow-y-auto bg-pitch border border-ice/25 rounded-lg p-3.5 font-mono text-[11px] flex flex-col gap-1.5 leading-5"
      >
        {visibleLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-ice-muted text-xs">
            Menunggu output serial dari ESP32-C3 SuperMini...
          </div>
        ) : (
          visibleLogs.map((entry) => {
            const isHighlight =
              entry.tag === "[SERVO]" || entry.tag === "[CRON]" || entry.tag === "[CMD]";
            const isError = entry.tag === "[ERR]";

            return (
              <div
                key={entry.id}
                className={`flex items-baseline gap-2 px-1.5 py-0.5 rounded ${
                  isHighlight ? "bg-ice/[0.04]" : ""
                }`}
              >
                <span className="text-ice-muted shrink-0">
                  [{formatWibClock(entry.created_at)}]
                </span>
                <span
                  className={`font-semibold shrink-0 ${
                    isError
                      ? "text-ice-fixed underline decoration-dashed"
                      : entry.isHeartbeat
                      ? "text-ice-muted"
                      : "text-ice"
                  }`}
                >
                  {entry.tag}
                </span>
                <span
                  className={
                    entry.isHeartbeat
                      ? "text-ice-muted/85"
                      : isHighlight
                      ? "text-ice-light"
                      : "text-ice-text"
                  }
                >
                  {entry.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between font-mono text-[10px] text-ice-muted">
        <span>BUFFER: {visibleLogs.length} baris aktif</span>
        <span className="text-ice/75">SUPABASE_REALTIME_STREAM</span>
      </div>
    </section>
  );
}