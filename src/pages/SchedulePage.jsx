import { useState, useEffect } from "react";
import { Cpu, CalendarCheck, Database } from "lucide-react";
import ScheduleForm from "../components/ScheduleForm";
import ScheduleCard from "../components/ScheduleCard";

const INITIAL_SCHEDULES = [
  {
    id: "SLOT_1",
    title: "Pakan Pagi Rutin",
    feedTime: "07:00",
    portionGram: 15,
    servoAngle: "90°",
    servoDuration: "1.5s",
    notes: "",
    isActive: true,
  },
  {
    id: "SLOT_2",
    title: "Pakan Sore Rutin",
    feedTime: "17:00",
    portionGram: 15,
    servoAngle: "90°",
    servoDuration: "1.5s",
    notes: "",
    isActive: true,
  },
  {
    id: "SLOT_3",
    title: "Pakan Malam Ringan",
    feedTime: "21:00",
    portionGram: 5,
    servoAngle: "45°",
    servoDuration: "0.8s",
    notes: "",
    isActive: false,
  },
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [rtcClock, setRtcClock] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setRtcClock(now.toLocaleTimeString("id-ID", { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddSchedule = (newSchedule) => {
    setSchedules((prev) =>
      [...prev, newSchedule].sort((a, b) => a.feedTime.localeCompare(b.feedTime))
    );
  };

  const handleToggleSchedule = (id) => {
    setSchedules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const handleDeleteSchedule = (id) => {
    setSchedules((prev) => prev.filter((item) => item.id !== id));
  };

  // Kalkulasi otomatis untuk ringkasan EEPROM & kuota harian
  const activeSchedules = schedules.filter((s) => s.isActive);
  const totalScheduledGrams = activeSchedules.reduce((sum, s) => sum + s.portionGram, 0);
  const hopperQuotaPct = ((totalScheduledGrams / 180) * 100).toFixed(1);
  const nextActiveSchedule = activeSchedules[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Top System Architecture Header */}
      <header className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-ice/20">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-ice tracking-widest uppercase bg-surface-low px-2 py-0.5 rounded border border-ice/20">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-ice animate-pulse" />
              ESP32_C3_EEPROM // CRON_SCHEDULE_SERVICE • DS3231_RTC_SYNC
            </span>
            <span className="font-mono text-[10px] text-ice-muted px-1">
              DEV_NODE: 0x2A_MAIN_POND
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-ice-text tracking-tight">
            Manajemen Jadwal & Form Pakan
          </h1>
          <p className="text-xs md:text-sm text-ice-muted max-w-3xl">
            Konfigurasi jadwal feeding otomatis, sinkronisasi memori non-volatile EEPROM ESP32-C3, dan manajemen kuota takaran dispenser.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-end shrink-0 bg-obsidian border border-ice/25 px-3.5 py-2 rounded">
          <Cpu className="w-4 h-4 text-ice" />
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-ice tracking-wider">SYNC_RTC: {rtcClock} WIB</span>
            <span className="text-[10px] text-ice-muted">EEPROM_STATUS: READY [0x04F]</span>
          </div>
        </div>
      </header>

      {/* Main Content: Asymmetric 2-Column Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (5 kolom): Formulir Jadwal Baru */}
        <section className="lg:col-span-5">
          <ScheduleForm onAddSchedule={handleAddSchedule} />
        </section>

        {/* Kolom Kanan (7 kolom): Daftar Jadwal Otomatis + EEPROM Footprint */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-ice" />
              <h2 className="text-base font-medium text-ice-text tracking-tight">
                Daftar Jadwal Otomatis
              </h2>
            </div>

            <span className="font-mono text-[10px] text-ice bg-surface-low border border-ice/25 px-2.5 py-1 rounded self-start sm:self-auto">
              {schedules.length} Slot Terdaftar • Kuota Harian: {totalScheduledGrams}g / 180g
            </span>
          </div>

          {/* Daftar Kartu Jadwal */}
          {schedules.length === 0 ? (
            <div className="bg-obsidian border border-dashed border-ice/25 rounded-lg p-8 text-center font-mono text-xs text-ice-muted">
              Belum ada jadwal terdaftar. Tambahkan jadwal baru melalui formulir di sebelah kiri.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {schedules.map((item, idx) => (
                <ScheduleCard
                  key={item.id}
                  schedule={item}
                  slotIndex={idx}
                  onToggle={handleToggleSchedule}
                  onDelete={handleDeleteSchedule}
                />
              ))}
            </div>
          )}

          {/* Ringkasan NVM_EEPROM Allocation Footprint */}
          <div className="mt-1 bg-obsidian rounded-lg border border-ice/20 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-ice/10 font-mono text-[10px]">
              <div className="flex items-center gap-1.5 text-ice uppercase tracking-wider">
                <Database className="w-3.5 h-3.5" />
                <span>NVM_EEPROM Allocation Footprint</span>
              </div>
              <span className="text-ice-muted">SECTOR_SIZE: 512B</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 font-mono">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-ice-muted uppercase">Total Pakan Terjadwal</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-ice-light">{totalScheduledGrams}</span>
                  <span className="text-[11px] text-ice">gram / hari</span>
                </div>
                <span className="text-[10px] text-ice-muted/80">{hopperQuotaPct}% dari kuota harian</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-ice-muted uppercase">Siklus Rotasi Servo</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-ice-text">{activeSchedules.length}x</span>
                  <span className="text-[11px] text-ice-muted">Aktif / hari</span>
                </div>
                <span className="text-[10px] text-ice-muted/80">Beban mekanik: Rendah (Optimal)</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-ice-muted uppercase">EEPROM Flash Health</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-ice-fixed">128</span>
                  <span className="text-[11px] text-ice-muted">/ 100k Cyc</span>
                </div>
                <div className="w-full h-1.5 bg-surface-low rounded-full mt-1.5 overflow-hidden border border-ice/20">
                  <div className="h-full bg-ice w-[12%]" />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-ice/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 font-mono text-[10px] text-ice-muted">
              <span>REG_HASH: 0x98A1_44DF • CHECKSUM_CRC32: PASS</span>
              <span className="text-ice/80">
                {nextActiveSchedule
                  ? `NEXT_CRON_TRIGGER: ${nextActiveSchedule.feedTime}:00 WIB (${nextActiveSchedule.title})`
                  : "NEXT_CRON_TRIGGER: STANDBY"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}