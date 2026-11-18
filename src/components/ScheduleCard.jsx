import { RotateCw, Timer, Trash2 } from "lucide-react";

export default function ScheduleCard({ schedule, slotIndex, onToggle, onDelete }) {
  const { id, title, feedTime, portionGram, servoAngle, servoDuration, notes, isActive } = schedule;
  const slotNumber = String(slotIndex + 1).padStart(2, "0");

  return (
    <div
      className={`rounded-lg p-4 md:p-5 border transition-all ${
        isActive
          ? "bg-obsidian border-ice/25 hover:border-ice/50"
          : "bg-obsidian/70 border-ice/10 opacity-75 hover:opacity-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Kiri: Waktu RTC & Detail Jadwal */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex flex-col shrink-0 font-mono">
            <span className="text-[10px] text-ice-muted">WAKTU_RTC</span>
            <span
              className={`text-2xl md:text-3xl font-semibold tracking-tighter ${
                isActive ? "text-ice" : "text-ice-muted"
              }`}
            >
              {feedTime}
            </span>
            <span className={`text-[10px] ${isActive ? "text-ice/80" : "text-ice-muted/60"}`}>
              {isActive ? "WIB (UTC+7)" : "WIB (STANDBY)"}
            </span>
          </div>

          <div className="h-12 w-px bg-ice/15 hidden sm:block self-center" />

          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-base font-semibold tracking-tight truncate ${
                  isActive ? "text-ice-text" : "text-ice-muted font-medium"
                }`}
              >
                {title}
              </h3>

              {isActive ? (
                <span className="font-mono text-[10px] text-ice bg-ice/10 border border-ice/30 px-2 py-0.5 rounded">
                  {portionGram} gram • Setiap Hari
                </span>
              ) : (
                <span className="font-mono text-[10px] text-ice-muted bg-surface-low border border-dashed border-ice-muted/40 px-2 py-0.5 rounded">
                  {portionGram} gram • Nonaktif
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-ice-muted font-mono text-[10px] flex-wrap">
              <span className="inline-flex items-center gap-1">
                <RotateCw className={`w-3 h-3 ${isActive ? "text-ice" : "text-ice-muted"}`} />
                Sudut Servo: {servoAngle}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Timer className={`w-3 h-3 ${isActive ? "text-ice" : "text-ice-muted"}`} />
                Durasi: {servoDuration}
              </span>
              <span>•</span>
              <span className={isActive ? "text-ice/80" : "text-ice-muted/60"}>
                SLOT_{slotNumber}: {isActive ? "ACTIVE" : "BYPASSED"}
              </span>
            </div>

            {notes && (
              <p className="text-[11px] text-ice-muted/90 font-mono truncate">
                Catatan: {notes}
              </p>
            )}
          </div>
        </div>

        {/* Kanan: Toggle Switch ON/OFF & Hapus */}
        <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-ice/10 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[10px] uppercase ${
                isActive ? "text-ice" : "text-ice-muted"
              }`}
            >
              {isActive ? "ON" : "OFF"}
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => onToggle(id)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus:outline-none ${
                isActive
                  ? "bg-ice border-ice/50"
                  : "bg-surface-low border-ice/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow transition duration-200 mt-0.5 ${
                  isActive
                    ? "translate-x-5 ml-0.5 bg-black"
                    : "translate-x-1 bg-ice-muted"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDelete(id)}
            title="Hapus Slot Jadwal"
            className="p-2 rounded border border-ice/20 bg-surface-low/60 hover:bg-surface-low hover:border-ice/50 text-ice-muted hover:text-ice-light transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}