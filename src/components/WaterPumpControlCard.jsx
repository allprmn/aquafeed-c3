import React, { useState, useEffect } from "react";
import { Droplets, Play, Loader2 } from "lucide-react";
import { useFeeder } from "../context/FeederContext";

export default function WaterPumpControlCard() {
  const { pumpActive, isTogglingPump, toggleWaterPump } = useFeeder();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!pumpActive) {
      setCountdown(0);
      return;
    }

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pumpActive]);

  const isRunning = pumpActive || isTogglingPump || countdown > 0;

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
              isRunning
                ? "bg-sky-500/15 border-sky-400/40 text-sky-400"
                : "bg-[#111827] border-[#1E293B] text-slate-400"
            }`}
          >
            <Droplets className={`w-5 h-5 ${isRunning ? "animate-bounce" : ""}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Pompa Air Mini (Pulse 5s)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Relay 5V • Pin GPIO 3 (Auto-Off setelah 5 detik)
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isRunning
              ? "bg-sky-500/15 text-sky-300 border-sky-400/30"
              : "bg-slate-800/80 text-slate-400 border-slate-700"
          }`}
        >
          {isRunning ? `Menyala (${countdown || 5}s)` : "Standby"}
        </span>
      </div>

      <button
        type="button"
        disabled={isRunning}
        onClick={() => toggleWaterPump(true)}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          isRunning
            ? "bg-sky-500/20 text-sky-300 border border-sky-400/40 cursor-not-allowed"
            : "bg-[#38BDF8] hover:bg-sky-300 text-[#05080F] shadow-lg shadow-sky-500/10"
        }`}
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengalirkan Air... ({countdown || 5} detik)</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Nyalakan Air (5 Detik)</span>
          </>
        )}
      </button>
    </div>
  );
}