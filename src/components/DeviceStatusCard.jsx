import { useState, useEffect } from "react";
import { Cpu, Wifi, Cog, Timer } from "lucide-react";

export default function DeviceStatusCard({ servoStatus = "Standby / Detached (0° • Dingin)" }) {
  // Simulasi countdown berjalan mundur setiap 1 detik
  const [secondsLeft, setSecondsLeft] = useState(4 * 3600 + 18 * 60 + 35);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="lg:col-span-5 bg-obsidian border border-ice/20 rounded-lg p-6 flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        {/* Header Kartu */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block font-mono text-[10px] text-ice bg-ice/10 border border-ice/30 px-2 py-0.5 rounded tracking-wider mb-1.5">
              TELEMETRY_NODE_ACTIVE
            </span>
            <h2 className="text-lg font-medium text-ice-text">Status Perangkat & Servo</h2>
            <p className="text-xs text-ice-muted mt-0.5">Telemetri Aktuator & Konektivitas Node</p>
          </div>
          <div className="p-2 rounded bg-surface-low border border-ice/20 text-ice shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* Spesifikasi Teknis */}
        <div className="flex flex-col divide-y divide-ice/10 font-mono text-xs">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-ice-muted text-[11px]">
              <Wifi className="w-3.5 h-3.5 text-ice" />
              <span>Mikrokontroler</span>
            </div>
            <span className="text-ice-light">
              ESP32-C3 SuperMini <span className="text-ice text-[11px]">(-58 dBm)</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-ice-muted text-[11px]">
              <Cog className="w-3.5 h-3.5 text-ice" />
              <span>Status Servo</span>
            </div>
            <span className="text-ice-text text-right">{servoStatus}</span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-ice-muted text-[11px]">
              <Timer className="w-3.5 h-3.5 text-ice" />
              <span>Uptime Sistem</span>
            </div>
            <span className="text-ice">14 Hari 06 Jam 22 Menit</span>
          </div>
        </div>

        {/* Blok Countdown Jadwal Berikutnya */}
        <div className="p-4 rounded bg-surface-low border border-ice/25 flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-ice-muted uppercase tracking-wider">JADWAL BERIKUTNYA</span>
            <span className="text-ice bg-ice/10 px-1.5 py-0.5 rounded border border-ice/20">SLOT_02</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 my-1 font-mono">
            <span className="text-2xl sm:text-3xl font-semibold text-ice tracking-wider drop-shadow-[0_0_8px_rgba(125,211,252,0.3)]">
              {hours} : {minutes} : {seconds}
            </span>
            <span className="text-[10px] text-ice-muted">COUNTDOWN</span>
          </div>
          <p className="font-mono text-[11px] text-ice-muted">
            Pukul 17:00 WIB • Takaran: <span className="text-ice-text font-semibold">10g</span> (Pakan Sore)
          </p>
        </div>
      </div>

      {/* Footer Status Cron */}
      <div className="mt-4 pt-3 border-t border-ice/15 flex items-center justify-between font-mono text-[10px]">
        <span className="text-ice-muted">AUTO_FEED_CRON: ACTIVE</span>
        <span className="text-ice">SYNC_OK</span>
      </div>
    </div>
  );
}