import { useState, useEffect, useMemo } from "react";
import { Cpu, CalendarCheck, Database } from "lucide-react";
import { useFeeder } from "../context/FeederContext";
import ScheduleForm from "../components/ScheduleForm";
import ScheduleCard from "../components/ScheduleCard";
import { LoadingSkeleton } from "../components/StateFeedback";

function getJakartaTimeParts() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const formatted = formatter.format(new Date()); // "HH:MM:SS"
  return {
    full: formatted,
    hhmm: formatted.slice(0, 5),
  };
}

export default function SchedulePage() {
  const {
    schedules = [],
    logs = [],
    isLoading,
    addSchedule,
    toggleSchedule,
    deleteSchedule,
  } = useFeeder();

  const [rtcClock, setRtcClock] = useState(() => getJakartaTimeParts().full);
  const [currentHHMM, setCurrentHHMM] = useState(() => getJakartaTimeParts().hhmm);

  useEffect(() => {
    const updateClock = () => {
      const nowWib = getJakartaTimeParts();
      setRtcClock(nowWib.full);
      setCurrentHHMM(nowWib.hhmm);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeSchedules = useMemo(
    () =>
      schedules
        .filter((s) => s.isActive)
        .sort((a, b) => a.feedTime.localeCompare(b.feedTime)),
    [schedules]
  );

  const totalScheduledGrams = activeSchedules.reduce((sum, s) => sum + s.portionGram, 0);
  const hopperQuotaPct = ((totalScheduledGrams / 180) * 100).toFixed(1);
  const totalWriteCycles = schedules.length + logs.length;

  const nextScheduleInfo = useMemo(() => {
    if (activeSchedules.length === 0) return null;
    const upcomingToday = activeSchedules.find((s) => s.feedTime > currentHHMM);
    if (upcomingToday) {
      return { schedule: upcomingToday, isTomorrow: false };
    }
    return { schedule: activeSchedules[0], isTomorrow: true };
  }, [activeSchedules, currentHHMM]);

  return (
    <div className="flex flex-col gap-6">
      <header className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-ice/20">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-3xl font-semibold text-ice-text tracking-tight">
            Manajemen Jadwal & Form Pakan
          </h1>
          <p className="text-xs md:text-sm text-ice-muted max-w-3xl">
            Konfigurasi jadwal feeding otomatis, sinkronisasi database Supabase, dan manajemen kuota takaran dispenser.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-end shrink-0 bg-obsidian border border-ice/25 px-3.5 py-2 rounded">
          <Cpu className="w-4 h-4 text-ice" />
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-ice tracking-wider">SYNC_RTC: {rtcClock} WIB</span>
            <span className="text-[10px] text-ice-muted">ZONA: ASIA/JAKARTA (UTC+7)</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-5">
          <ScheduleForm onAddSchedule={addSchedule} />
        </section>

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

          {isLoading ? (
            <div className="bg-obsidian border border-ice/20 rounded-lg">
              <LoadingSkeleton />
            </div>
          ) : schedules.length === 0 ? (
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
                  onToggle={toggleSchedule}
                  onDelete={deleteSchedule}
                />
              ))}
            </div>
          )}

          
        </section>
      </div>
    </div>
  );
}