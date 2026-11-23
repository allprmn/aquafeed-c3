import { useState, useEffect } from "react";
import { RefreshCw, Scale, Bot } from "lucide-react";
import { useFeeder } from "../context/FeederContext";
import ManualFeedCard from "../components/ManualFeedCard";
import DeviceStatusCard from "../components/DeviceStatusCard";
import TelemetryCard from "../components/TelemetryCard";
import RecentActivityTable from "../components/RecentActivityTable";
import SerialMonitorCard from "../components/SerialMonitorCard";
import WaterPumpControlCard from "../components/WaterPumpControlCard";

export default function DashboardPage() {
  const { logs, schedules, device, serialLogs, todayStats, triggerManualFeed, clearSerialLogs } = useFeeder();
  const [clockText, setClockText] = useState("");
  const [localServoState, setLocalServoState] = useState(null);

  useEffect(() => {
    const updateClock = () => {
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
      setClockText(`RTC_UTC+7: ${formatted} WIB`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualFeed = async (portion) => {
    try {
      setLocalServoState(`Active / Moving (${portion.angle})`);
      await triggerManualFeed(portion);
      setTimeout(() => setLocalServoState(null), 2500);
    } catch (err) {
      console.error("Gagal memicu pakan manual:", err.message);
      setLocalServoState(null);
    }
  };

  const recentFourLogs = logs.slice(0, 4).map((item) => ({
    id: item.uuid || item.id,
    code: item.id,
    time: item.timeLabel,
    batch: `Batch #${item.id}`,
    method: item.method === "Manual" ? "Manual (Web UI)" : "Otomatis",
    portion: `${item.portionGram}g (${item.servoAngle})`,
    angle: item.servoAngle,
    durationMs: item.servoDurationMs,
    latency: `${item.latencyMs} ms`,
    status: item.status.toUpperCase(),
  }));

  const activeSchedules = schedules.filter((s) => s.isActive);
  const activeScheduleCount = activeSchedules.length;

  // Target harian otomatis dihitung dari total takaran jadwal aktif
  const dailyTargetGrams = activeSchedules.reduce((sum, s) => sum + s.portionGram, 0);
  const targetPercent =
    dailyTargetGrams > 0
      ? Math.min(100, Math.round((todayStats.todayGrams / dailyTargetGrams) * 100))
      : 100;
  const remainingGrams = Math.max(0, dailyTargetGrams - todayStats.todayGrams);

  const lastLog = logs[0];
  const lastFedText = lastLog
    ? `${lastLog.timeLabel} (${lastLog.method} ${lastLog.portionGram}g)`
    : "Belum ada riwayat pemberian pakan";

  const currentServoState =
    localServoState || device?.servo_state || "Standby / Detached (0° • Dingin)";

  return (
    <div className="flex flex-col gap-6">
      {/* Top Telemetry Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-ice/15 pb-4">
        <div className="flex flex-col gap-1">
          
          <h1 className="text-2xl md:text-3xl font-semibold text-ice-text tracking-tight">
            Dashboard Kontrol & Telemetri Real-time
          </h1>
          <p className="font-mono text-xs text-ice-muted">
            SISTEM AKUAKULTUR OTOMATIS
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto bg-obsidian border border-ice/20 px-3 py-1.5 rounded font-mono text-[11px] text-ice-light">
          
          <span>{clockText}</span>
        </div>
      </section>

      {/* Grid Atas: Kontrol Manual & Status Perangkat */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <ManualFeedCard onTriggerFeed={handleManualFeed} lastFedText={lastFedText} />
        <DeviceStatusCard
          servoStatus={currentServoState}
          device={device}
          schedules={schedules}
        />
      </section>

       <WaterPumpControlCard/>

      {/* Baris 2 Kartu KPI Utama */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TelemetryCard title="TOTAL PAKAN HARI INI" value={todayStats.todayGrams} unit="gram" icon={Scale}>
          <span className="text-[11px] text-ice-muted">
            {todayStats.feedCount} kali pemberian{" "}
            <span className="text-ice-muted/70">
              ({dailyTargetGrams > 0 ? `Target Jadwal: ${dailyTargetGrams}g` : "Tanpa Target Aktif"})
            </span>
          </span>
          <div className="w-full flex items-center justify-between text-[10px]">
            <span className="text-ice">
              {dailyTargetGrams > 0 ? `${targetPercent}% Target Tercapai` : "Mode Manual Bebas"}
            </span>
            <span className="text-ice-muted">
              {dailyTargetGrams > 0 ? `${remainingGrams}g Sisa` : `${todayStats.todayGrams}g Terkirim`}
            </span>
          </div>
        </TelemetryCard>

        <TelemetryCard
          title="MODE OPERASI"
          value={activeScheduleCount > 0 ? "Otomatis" : "Manual"}
          icon={Bot}
          highlight
        >
          <span className="text-[11px] text-ice-muted">
            {activeScheduleCount > 0
              ? `${activeScheduleCount} jadwal aktif (NTP Synced)`
              : "0 jadwal aktif • Menunggu pemicu manual"}
          </span>
          <div className="inline-flex self-start text-[10px] text-ice bg-ice/10 border border-ice/30 px-2 py-0.5 rounded tracking-wide">
            SUPABASE REALTIME
          </div>
        </TelemetryCard>
      </section>

     

      {/* Tabel Aktivitas Terbaru */}
      <RecentActivityTable logs={recentFourLogs} />
      
      {/* Serial Monitor Real-time */}
      <SerialMonitorCard
        serialLogs={serialLogs}
        device={device}
        onClear={clearSerialLogs}
      />
    </div>
  );
}