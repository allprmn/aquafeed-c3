import React from 'react';
import { Droplets, Power, PowerOff } from 'lucide-react';
import { useFeeder } from '../context/FeederContext';

export default function WaterPumpControlCard() {
  const { pumpActive, isTogglingPump, toggleWaterPump } = useFeeder();

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
              pumpActive
                ? 'bg-sky-500/15 border-sky-400/40 text-sky-400'
                : 'bg-[#111827] border-[#1E293B] text-slate-400'
            }`}
          >
            <Droplets className={`w-5 h-5 ${pumpActive ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Kontrol Pompa Air Mini</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Relay 5V • Pin GPIO 3 (Submersible 3V–5V)
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            pumpActive
              ? 'bg-sky-500/15 text-sky-300 border-sky-400/30'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          {pumpActive ? 'Air Menyala' : 'Mati / Standby'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isTogglingPump || pumpActive}
          onClick={() => toggleWaterPump(true)}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            pumpActive
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 cursor-default'
              : 'bg-[#38BDF8] hover:bg-sky-300 text-[#05080F] shadow-lg shadow-sky-500/10 disabled:opacity-50'
          }`}
        >
          <Power className="w-4 h-4" />
          Nyalakan Air
        </button>

        <button
          type="button"
          disabled={isTogglingPump || !pumpActive}
          onClick={() => toggleWaterPump(false)}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            !pumpActive
              ? 'bg-[#111827] text-slate-500 border border-[#1E293B] cursor-default'
              : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 disabled:opacity-50'
          }`}
        >
          <PowerOff className="w-4 h-4" />
          Matikan Air
        </button>
      </div>
    </div>
  );
}