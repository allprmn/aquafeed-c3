import { useState, useEffect, useMemo } from "react";
import { Cpu, Wifi, Settings, Clock } from "lucide-react";
import { useFeeder } from "../context/FeederContext";

function getJakartaNowSeconds(timestampMs = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(timestampMs));

  const h = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value || 0);
  const s = Number(parts.find((p) => p.type === "second")?.value || 0);
  return h * 3600 + m * 60 + s;
}

function formatWibClockOnly(isoString) {
  if (!isoString) return null;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(isoString));
}

export default function DeviceStatusCard({
  servoStatus,
  device: propDevice,
  schedules: propSchedules,
}) {
  const context = useFeeder();
  const device = propDevice ?? context?.device ?? null;
  const schedules = propSchedules ?? context?.schedules ?? [];

  const [nowMs, setNowMs] = useState(() => Date.now());

  // Tick setiap 1 detik untuk countdown jadwal & usia heartbeat real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const nowSeconds = useMemo(() => getJakartaNowSeconds(nowMs), [nowMs]);

  // Hitung selisih waktu sejak heartbeat terakhir dari ESP32-C3
  const lastSeenMs = device?.last_seen ? new Date(device.last_seen).getTime() : null;
  const elapsedSeconds =
    lastSeenMs !== null ? Math.max(0, Math.floor((nowMs - lastSeenMs) / 1000)) : null;
  const isOnline = elapsedSeconds !== null && elapsedSeconds < 45;
  const lastSeenClock = formatWibClockOnly(device?.last_seen);

  // Teks dinamis Mikrokontroler & Sinyal Wi-Fi (RSSI)
  const microcontrollerLabel = useMemo(() => {
    if (!device) return "Memuat node ESP32-C3...";
    if (isOnline) {
      return `ESP32-C3 SuperMini (${device.rssi || "Terhubung"})`;
    }
    return `ESP32-C3 SuperMini (Terputus • Last: ${device.rssi || "-"})`;
  }, [device, isOnline]);

  // Teks dinamis Status Aktuator Servo
  const effectiveServoRaw = servoStatus || device?.servo_state || "";
  const isServoMoving =
    effectiveServoRaw.toLowerCase().includes("active") ||
    effectiveServoRaw.toLowerCase().includes("moving");

  const servoLabel = useMemo(() => {
    if (isServoMoving) return effectiveServoRaw;
    if (!device) return "Memuat status aktuator...";
    if (!isOnline) return "Tidak Aktif (Node Offline)";
    return device.servo_state || "Standby / Detached (0° • Dingin)";
  }, [isServoMoving, effectiveServoRaw, device, isOnline]);

  // Teks dinamis Heartbeat Node dengan penghitung detik berjalan
  const heartbeatLabel = useMemo(() => {
    if (!lastSeenClock || elapsedSeconds === null) {
      return "Menunggu sinyal heartbeat...";
    }
    if (isOnline) {
      return `Online • ${elapsedSeconds} dtk lalu (${lastSeenClock} WIB)`;
    }
    return `Offline • Terakhir ${lastSeenClock} WIB`;
  }, [lastSeenClock, elapsedSeconds, isOnline]);

  // Hitung jadwal aktif terdekat berikutnya + countdown HH:MM:SS
  const nextScheduleData = useMemo(() => {
    const activeList = schedules
      .filter((s) => s.isActive)
      .sort((a, b) => a.feedTime.localeCompare(b.feedTime));

    if (activeList.length === 0) return null;

    let targetIndex = activeList.findIndex((s) => {
      const [hh, mm] = s.feedTime.split(":").map(Number);
      return hh * 3600 + mm * 60 > nowSeconds;
    });

    let isTomorrow = false;
    if (targetIndex === -1) {
      targetIndex = 0;
      isTomorrow = true;
    }

    const target = activeList[targetIndex];
    const [tHour, tMin] = target.feedTime.split(":").map(Number);
    const targetSeconds = tHour * 3600 + tMin * 60;

    const diffSeconds = isTomorrow
      ? 24 * 3600 - nowSeconds + targetSeconds
      : targetSeconds - nowSeconds;

    const hrs = String(Math.floor(diffSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((diffSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(diffSeconds % 60).padStart(2, "0");

    return {
      slotLabel: `SLOT_${String(targetIndex + 1).padStart(2, "0")}`,
      countdown: `${hrs} : ${mins} : ${secs}`,
      feedTime: target.feedTime,
      portionGram: target.portionGram,
      title: target.title,
      isTomorrow,
    };
  }, [schedules, nowSeconds]);

  return (
    <div className="lg:col-span-5 bg-obsidian border border-ice/20 rounded-lg p-5 md:p-6 flex flex-col justify-between gap-5">
      {/* Header Status */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span
            className={`self-start font-mono text-[10px] px-2 py-0.5 rounded border tracking-wider ${
              isOnline
                ? "text-ice bg-ice/10 border-ice/30"
                : "text-ice-muted bg-surface-low border-ice/15"
            }`}
          >
            {isOnline ? "TELEMETRY_NODE_ACTIVE" : "TELEMETRY_NODE_OFFLINE"}
          </span>
          <h2 className="text-lg font-medium text-ice-text mt-1">Status Perangkat & Servo</h2>
          <p className="text-xs text-ice-muted">
            Node ID: {device?.id || "esp32-c3-01"} • Telemetri Aktuator
          </p>
        </div>

        <div className="p-2 rounded bg-surface-low border border-ice/20 text-ice">
          <Cpu className="w-5 h-5" />
        </div>
      </div>

      {/* Daftar Telemetri Node */}
      <div className="flex flex-col gap-3 font-mono text-xs">
        <div className="flex items-center justify-between gap-2 py-1.5 border-b border-ice/10">
          <span className="text-ice-muted flex items-center gap-2 shrink-0">
            <Wifi className={`w-3.5 h-3.5 ${isOnline ? "text-ice" : "text-ice-muted"}`} />
            Mikrokontroler
          </span>
          <span
            className={`font-medium text-right ${
              isOnline ? "text-ice-text" : "text-ice-muted"
            }`}
          >
            {microcontrollerLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1.5 border-b border-ice/10">
          <span className="text-ice-muted flex items-center gap-2 shrink-0">
            <Settings className={`w-3.5 h-3.5 ${isServoMoving ? "text-ice animate-spin" : "text-ice"}`} />
            Status Servo
          </span>
          <span
            className={`font-medium text-right ${
              isServoMoving
                ? "text-ice"
                : isOnline
                ? "text-ice-text"
                : "text-ice-muted"
            }`}
          >
            {servoLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1.5">
          <span className="text-ice-muted flex items-center gap-2 shrink-0">
            <Clock className={`w-3.5 h-3.5 ${isOnline ? "text-ice" : "text-ice-muted"}`} />
            Heartbeat Node
          </span>
          <span
            className={`font-medium text-right ${
              isOnline ? "text-ice" : "text-ice-muted"
            }`}
          >
            {heartbeatLabel}
          </span>
        </div>
      </div>

      {/* Kotak Countdown Jadwal Berikutnya */}
      <div className="bg-surface-low/80 border border-ice/20 rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="text-ice-muted uppercase tracking-wider">JADWAL BERIKUTNYA</span>
          <span className="px-2 py-0.5 rounded bg-obsidian border border-ice/25 text-ice">
            {nextScheduleData ? nextScheduleData.slotLabel : "NO_SLOT"}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2 my-1">
          <span className="font-mono text-2xl md:text-3xl font-semibold text-ice tracking-wider">
            {nextScheduleData ? nextScheduleData.countdown : "-- : -- : --"}
          </span>
          <span className="font-mono text-[10px] text-ice-muted uppercase">COUNTDOWN</span>
        </div>

        <p className="font-mono text-xs text-ice-muted truncate">
          {nextScheduleData ? (
            <>
              Pukul <span className="text-ice-text">{nextScheduleData.feedTime} WIB</span>
              {nextScheduleData.isTomorrow ? " (Besok)" : ""} • Takaran:{" "}
              <span className="text-ice-text font-semibold">{nextScheduleData.portionGram}g</span> (
              {nextScheduleData.title})
            </>
          ) : (
            "Belum ada jadwal otomatis yang aktif"
          )}
        </p>
      </div>

      {/* Footer Status Cron */}
      <div className="pt-2 border-t border-ice/10 flex items-center justify-between font-mono text-[10px]">
        <span className="text-ice-muted">
          AUTO_FEED_CRON: {nextScheduleData ? "ACTIVE" : "STANDBY"}
        </span>
        <span className={isOnline ? "text-ice font-semibold" : "text-ice-muted"}>
          {isOnline ? "SYNC_OK" : "NODE_OFFLINE"}
        </span>
      </div>
    </div>
  );
}