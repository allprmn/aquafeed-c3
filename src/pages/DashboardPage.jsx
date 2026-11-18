import { useState, useEffect } from "react";
import { RefreshCw, Package, Thermometer, Scale, Bot } from "lucide-react";
import ManualFeedCard from "../components/ManualFeedCard";
import DeviceStatusCard from "../components/DeviceStatusCard";
import TelemetryCard from "../components/TelemetryCard";
import RecentActivityTable from "../components/RecentActivityTable";

const INITIAL_LOGS = [
  {
    id: 1,
    time: "Hari ini, 07:00 WIB",
    batch: "Batch #20261118-01",
    method: "Otomatis",
    portion: "10g (90°)",
    temp: "27.4°C",
    latency: "18 ms",
    status: "BERHASIL",
  },
  {
    id: 2,
    time: "Kemarin, 17:30 WIB",
    batch: "Batch #20261117-03",
    method: "Otomatis",
    portion: "10g (90°)",
    temp: "27.8°C",
    latency: "21 ms",
    status: "BERHASIL",
  },
  {
    id: 3,
    time: "Kemarin, 14:15 WIB",
    batch: "Batch #20261117-02",
    method: "Manual (Web UI)",
    portion: "5g (45°)",
    temp: "27.9°C",
    latency: "14 ms",
    status: "BERHASIL",
  },
  {
    id: 4,
    time: "Kemarin, 07:00 WIB",
    batch: "Batch #20261117-01",
    method: "Otomatis",
    portion: "10g (90°)",
    temp: "27.2°C",
    latency: "19 ms",
    status: "BERHASIL",
  },
];

export default function DashboardPage() {
  const [clockText, setClockText] = useState("");
  const [recentLogs, setRecentLogs] = useState(INITIAL_LOGS);
  const [todayGrams, setTodayGrams] = useState(20);
  const [feedCount, setFeedCount] = useState(2);
  const [feedPercent, setFeedPercent] = useState(78);
  const [lastFed, setLastFed] = useState("Hari ini, 07:00 WIB (Otomatis)");
  const [servoState, setServoState] = useState("Standby / Detached (0° • Dingin)");

  // Jam RTC real-time di header halaman
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("id-ID", { hour12: false });
      setClockText(`RTC_UTC+7: ${timeStr} WIB`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handler ketika tombol Beri Makan Sekarang ditekan
  const handleManualFeed = (portion) => {
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    setServoState(`Active / Moving (${portion.angle})`);
    setTimeout(() => setServoState("Standby / Detached (0° • Dingin)"), 2000);

    setTodayGrams((prev) => prev + portion.grams);
    setFeedCount((prev) => prev + 1);
    setFeedPercent((prev) => Math.max(0, prev - 1));
    setLastFed(`Hari ini, ${nowTime} WIB (Manual ${portion.grams}g)`);

    const newLog = {
      id: Date.now(),
      time: `Hari ini, ${nowTime} WIB`,
      batch: `Batch #${Math.floor(100000 + Math.random() * 900000)}`,
      method: "Manual (Web UI)",
      portion: `${portion.grams}g (${portion.angle})`,
      temp: "27.4°C",
      latency: "16 ms",
      status: "BERHASIL",
    };

    setRecentLogs((prev) => [newLog, ...prev.slice(0, 3)]);
  };

  const targetPercent = Math.min(100, Math.round((todayGrams / 30) * 100));

  return (
    <div className="flex flex-col gap-6">
      {/* Top Telemetry Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-ice/15 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-ice shadow-[0_0_8px_rgba(125,211,252,0.8)]" />
            <span className="font-mono text-[10px] text-ice-muted tracking-widest uppercase">
              SISTEM AKUAKULTUR OTOMATIS // UNIT KOLAM #01
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-ice-text tracking-tight">
            Dashboard Kontrol & Telemetri Real-time
          </h1>
          <p className="font-mono text-xs text-ice-muted">
            Node MCU ESP32-C3 SuperMini • Firmware v2.4.1-rc3 • feeder.aldipramana.my.id
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto bg-obsidian border border-ice/20 px-3 py-1.5 rounded font-mono text-[11px] text-ice-light">
          <RefreshCw className="w-3.5 h-3.5 text-ice" />
          <span>{clockText}</span>
        </div>
      </section>

      {/* Grid Atas: Kontrol Manual (7 kolom) & Status Perangkat (5 kolom) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <ManualFeedCard onTriggerFeed={handleManualFeed} lastFedText={lastFed} />
        <DeviceStatusCard servoStatus={servoState} />
      </section>

      {/* Baris 4 Kartu KPI Telemetri */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TelemetryCard title="SISA KAPASITAS PAKAN" value={feedPercent} unit="%" icon={Package}>
          <div className="w-full h-2 rounded bg-surface-low border border-ice/15 overflow-hidden p-0.5">
            <div
              className="h-full bg-ice rounded shadow-[0_0_10px_rgba(125,211,252,0.6)] transition-all duration-500"
              style={{ width: `${feedPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-ice-muted">
            Kapasitas Hopper: {((feedPercent / 100) * 2).toFixed(2)} kg / 2.0 kg
          </span>
        </TelemetryCard>

        <TelemetryCard title="SUHU AIR AKUARIUM" value="27.4" unit="°C" icon={Thermometer}>
          <span className="text-[11px] text-ice-light">Stabil • Sensor DS18B20</span>
          <div className="inline-flex self-start text-[10px] text-ice-muted bg-surface-low px-2 py-0.5 rounded border border-ice/15">
            Target: 26.0 - 28.5°C
          </div>
        </TelemetryCard>

        <TelemetryCard title="TOTAL PAKAN HARI INI" value={todayGrams} unit="gram" icon={Scale}>
          <span className="text-[11px] text-ice-muted">
            {feedCount} kali pemberian <span className="text-ice-muted/70">(Target: 30g)</span>
          </span>
          <div className="w-full flex items-center justify-between text-[10px]">
            <span className="text-ice">{targetPercent}% Target Tercapai</span>
            <span className="text-ice-muted">{Math.max(0, 30 - todayGrams)}g Sisa</span>
          </div>
        </TelemetryCard>

        <TelemetryCard title="MODE OPERASI" value="Otomatis" icon={Bot} highlight>
          <span className="text-[11px] text-ice-muted">3 jadwal aktif (DS3231 Synced)</span>
          <div className="inline-flex self-start text-[10px] text-ice bg-ice/10 border border-ice/30 px-2 py-0.5 rounded tracking-wide">
            NTP SYNCED
          </div>
        </TelemetryCard>
      </section>

      {/* Tabel Aktivitas Terbaru */}
      <RecentActivityTable logs={recentLogs} />
    </div>
  );
}