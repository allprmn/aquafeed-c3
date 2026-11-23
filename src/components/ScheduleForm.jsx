import { useState, useEffect, useRef } from "react";
import { Clock, Info, Cpu, CheckCircle2, ChevronDown, RotateCw } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const QUICK_PRESETS = ["07:00", "12:00", "17:00", "21:00"];

const SERVO_ANGLE_OPTIONS = [
  {
    angle: "45°",
    title: "45°",
    desc: "Kecil • 5g",
    duration: "0.8s",
    grams: 5,
  },
  {
    angle: "60°",
    title: "60°",
    desc: "Sedang • 10g",
    duration: "1.5s",
    grams: 10,
  },
  {
    angle: "90°",
    title: "90°",
    desc: "Lebar • 15g",
    duration: "2.2s",
    grams: 15,
  },
];

function getWibTimePlusMinutes(offsetMinutes = 0) {
  const target = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(target);
}

export default function ScheduleForm({ onAddSchedule }) {
  const [title, setTitle] = useState("");
  const [feedTime, setFeedTime] = useState(() => getWibTimePlusMinutes(5));
  const [servoAngle, setServoAngle] = useState("60°");
  const [notes, setNotes] = useState("");

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedHour = "12", selectedMinute = "00"] = feedTime.split(":");

  const validate = (values) => {
    const nextErrors = {};
    const trimmedTitle = values.title.trim();

    if (!trimmedTitle) {
      nextErrors.title = "Nama jadwal wajib diisi.";
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = "Nama jadwal minimal 3 karakter.";
    } else if (trimmedTitle.length > 32) {
      nextErrors.title = "Nama jadwal maksimal 32 karakter.";
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(values.feedTime)) {
      nextErrors.feedTime = "Format waktu harus 24 jam (HH:MM WIB).";
    }

    if (!SERVO_ANGLE_OPTIONS.some((opt) => opt.angle === values.servoAngle)) {
      nextErrors.servoAngle = "Pilih salah satu sudut bukaan servo (45°, 60°, atau 90°).";
    }

    if (values.notes.length > 120) {
      nextErrors.notes = "Catatan maksimal 120 karakter.";
    }

    return nextErrors;
  };

  const handleFieldChange = (field, value) => {
    const nextValues = {
      title,
      feedTime,
      servoAngle,
      notes,
      [field]: value,
    };

    if (field === "title") setTitle(value);
    if (field === "feedTime") setFeedTime(value);
    if (field === "servoAngle") setServoAngle(value);
    if (field === "notes") setNotes(value);

    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(nextValues));
  };

  const handleSelectHour = (hour) => {
    handleFieldChange("feedTime", `${hour}:${selectedMinute}`);
  };

  const handleSelectMinute = (minute) => {
    handleFieldChange("feedTime", `${selectedHour}:${minute}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate({ title, feedTime, servoAngle, notes });
    setErrors(validationErrors);
    setTouched({ title: true, feedTime: true, servoAngle: true, notes: true });

    if (Object.keys(validationErrors).length > 0) return;

    const selectedPreset =
      SERVO_ANGLE_OPTIONS.find((opt) => opt.angle === servoAngle) || SERVO_ANGLE_OPTIONS[1];

    try {
      setIsSubmitting(true);
      await onAddSchedule({
        title: title.trim(),
        feedTime,
        portionGram: selectedPreset.grams,
        servoAngle: selectedPreset.angle,
        servoDuration: selectedPreset.duration,
        notes: notes.trim(),
        notifyWebhook: true,
      });

      setTitle("");
      setServoAngle("60°");
      setNotes("");
      setTouched({});
      setErrors({});
      setIsPickerOpen(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err.message || "Gagal menyimpan jadwal ke Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePreset =
    SERVO_ANGLE_OPTIONS.find((opt) => opt.angle === servoAngle) || SERVO_ANGLE_OPTIONS[1];

  return (
    <div className="bg-obsidian rounded-lg border border-ice/20 p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Header Form */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-ice/15">
        <div>
          <h2 className="text-lg font-medium text-ice-text tracking-tight">Formulir Jadwal Baru</h2>
          <p className="text-xs text-ice-muted mt-0.5">
            Parameter waktu WIB (UTC+7) dan sudut bukaan aktuator servo SG90.
          </p>
        </div>
      </div>

      {/* Notifikasi Sukses / Error */}
      {submitSuccess && (
        <div className="mt-4 bg-ice/10 border border-ice/40 rounded p-3 flex items-center gap-2 font-mono text-xs text-ice-light">
          <CheckCircle2 className="w-4 h-4 text-ice shrink-0" />
          <span>Jadwal berhasil disimpan & disinkronkan ke ESP32-C3!</span>
        </div>
      )}

      {submitError && (
        <div className="mt-4 bg-surface-low border border-dashed border-ice-fixed rounded p-3 flex items-center gap-2 font-mono text-xs text-ice-light">
          <Info className="w-4 h-4 text-ice shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Controlled Form */}
      <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
        {/* Field 1: Nama Jadwal */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono">
            <label htmlFor="sched-name" className="text-[11px] text-ice-text uppercase tracking-wide">
              Nama Jadwal <span className="text-ice">*</span>
            </label>
          </div>
          <input
            id="sched-name"
            type="text"
            value={title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
            placeholder="Contoh: Pakan Siang Tambahan"
            className={`w-full bg-[#030608] rounded px-3 py-2 text-xs text-ice-text font-mono focus:outline-none transition-all ${
              touched.title && errors.title
                ? "border-2 border-dashed border-ice-fixed"
                : "border border-ice/25 focus:border-ice"
            }`}
          />
          {touched.title && errors.title && (
            <p className="font-mono text-[11px] text-ice-light flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-ice shrink-0" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Field 2: Custom 24-Hour Time Picker (WIB) */}
        <div className="flex flex-col gap-1.5 relative" ref={pickerRef}>
          <div className="flex items-center justify-between font-mono">
            <label htmlFor="sched-time-btn" className="text-[11px] text-ice-text uppercase tracking-wide">
              Waktu Eksekusi (WIB) <span className="text-ice">*</span>
            </label>
          </div>

          <button
            id="sched-time-btn"
            type="button"
            onClick={() => setIsPickerOpen((prev) => !prev)}
            className={`w-full bg-[#030608] rounded px-3 py-2.5 flex items-center justify-between font-mono transition-all cursor-pointer ${
              isPickerOpen
                ? "border border-ice ring-1 ring-ice/40"
                : "border border-ice/25 hover:border-ice/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-ice" />
              <span className="text-base font-semibold text-ice-light tracking-wider">
                {feedTime}
              </span>
              <span className="text-[10px] text-ice bg-ice/10 border border-ice/30 px-1.5 py-0.5 rounded">
                WIB
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-ice transition-transform ${
                isPickerOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isPickerOpen && (
            <div className="mt-1 bg-[#030608] border border-ice/40 rounded-lg p-3 shadow-[0_12px_32px_rgba(0,0,0,0.9)] z-30 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-ice/15 font-mono">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      handleFieldChange("feedTime", preset);
                      setIsPickerOpen(false);
                    }}
                    className={`px-2 py-1 rounded text-[10px] border transition-colors cursor-pointer ${
                      feedTime === preset
                        ? "bg-ice text-black font-bold border-ice"
                        : "bg-surface-low text-ice-text border-ice/20 hover:border-ice/50"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange("feedTime", getWibTimePlusMinutes(2));
                    setIsPickerOpen(false);
                  }}
                  className="ml-auto px-2 py-1 rounded text-[10px] bg-ice/15 text-ice border border-ice/40 hover:bg-ice/25 transition-colors cursor-pointer"
                >
                  +2 Menit (Uji)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-ice-muted uppercase text-center">
                    Jam (00–23)
                  </span>
                  <div className="h-40 overflow-y-auto border border-ice/15 rounded bg-obsidian p-1 grid grid-cols-3 gap-1">
                    {HOURS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleSelectHour(h)}
                        className={`py-1.5 rounded text-xs transition-colors cursor-pointer ${
                          selectedHour === h
                            ? "bg-ice text-black font-bold"
                            : "text-ice-text hover:bg-ice/15"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-ice-muted uppercase text-center">
                    Menit (00–59)
                  </span>
                  <div className="h-40 overflow-y-auto border border-ice/15 rounded bg-obsidian p-1 grid grid-cols-3 gap-1">
                    {MINUTES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleSelectMinute(m)}
                        className={`py-1.5 rounded text-xs transition-colors cursor-pointer ${
                          selectedMinute === m
                            ? "bg-ice text-black font-bold"
                            : "text-ice-text hover:bg-ice/15"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-full py-1.5 rounded bg-ice/15 hover:bg-ice/25 border border-ice/40 text-ice font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Terapkan Waktu ({feedTime} WIB)
              </button>
            </div>
          )}

          {touched.feedTime && errors.feedTime ? (
            <p className="font-mono text-[11px] text-ice-light">{errors.feedTime}</p>
          ) : (
            <p className="font-mono text-[10px] text-ice-muted">
              Format 24 jam Asia/Jakarta tersinkron dengan NTP ESP32-C3
            </p>
          )}
        </div>

        {/* Field 3: Pilihan Sudut Servo (3 Opsi: 45°, 60°, 90°) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[11px] text-ice-text uppercase tracking-wide flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-ice" />
              Sudut Bukaan Servo <span className="text-ice">*</span>
            </span>
          </div>

          <div role="radiogroup" aria-label="Sudut Bukaan Servo" className="grid grid-cols-3 gap-2">
            {SERVO_ANGLE_OPTIONS.map((option) => {
              const isSelected = servoAngle === option.angle;
              return (
                <button
                  key={option.angle}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleFieldChange("servoAngle", option.angle)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded border font-mono transition-all cursor-pointer ${
                    isSelected
                      ? "bg-ice/15 border-ice text-ice-light shadow-[0_0_12px_rgba(125,211,252,0.18)]"
                      : "bg-[#030608] border-ice/25 text-ice-muted hover:border-ice/50 hover:text-ice-text"
                  }`}
                >
                  <span
                    className={`text-base font-bold tracking-tight ${
                      isSelected ? "text-ice" : "text-ice-text"
                    }`}
                  >
                    {option.title}
                  </span>
                  <span className="text-[10px] mt-0.5">{option.desc}</span>
                </button>
              );
            })}
          </div>

          <p className="font-mono text-[10px] text-ice-muted">
            Konfigurasi terpilih: Sudut <span className="text-ice">{activePreset.angle}</span> • Durasi buka{" "}
            <span className="text-ice-light">{activePreset.duration}</span> (Estimasi {activePreset.grams}g)
          </p>

          {touched.servoAngle && errors.servoAngle && (
            <p className="font-mono text-[11px] text-ice-light flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-ice shrink-0" />
              <span>{errors.servoAngle}</span>
            </p>
          )}
        </div>

        {/* Field 4: Catatan Singkat */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono">
            <label htmlFor="sched-notes" className="text-[11px] text-ice-text uppercase tracking-wide">
              Catatan Singkat (Opsional)
            </label>
            <span className="text-[10px] text-ice-muted">CHAR_MAX: {notes.length}/120</span>
          </div>
          <textarea
            id="sched-notes"
            rows={2}
            value={notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            placeholder="Contoh: Porsi khusus ikan koi besar..."
            className="w-full bg-[#030608] border border-ice/25 focus:border-ice rounded px-3 py-2 text-xs text-ice-text font-mono placeholder:text-ice-muted/60 focus:outline-none transition-all resize-none"
          />
          {errors.notes && (
            <p className="font-mono text-[11px] text-ice-light">{errors.notes}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-ice hover:bg-ice-fixed disabled:opacity-60 active:scale-[0.99] text-black font-mono text-xs font-bold uppercase tracking-wider rounded border border-ice-fixed flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(125,211,252,0.25)] hover:shadow-[0_0_24px_rgba(125,211,252,0.45)] transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>{isSubmitting ? "Menyimpan..." : "Simpan Jadwal ke ESP32"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}