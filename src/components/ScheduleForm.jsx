import { useState } from "react";
import { Clock, Info, Cpu, Terminal, CheckCircle2 } from "lucide-react";

export default function ScheduleForm({ onAddSchedule }) {
  // Form State (Controlled Inputs)
  const [title, setTitle] = useState("");
  const [feedTime, setFeedTime] = useState("12:30");
  const [portionGram, setPortionGram] = useState("15");
  const [notes, setNotes] = useState("");
  const [notifyWebhook, setNotifyWebhook] = useState(true);

  // State Validasi & Feedback Submit
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fungsi validasi seluruh field
  const validate = (values) => {
    const nextErrors = {};
    const trimmedTitle = values.title.trim();
    const numericPortion = Number(values.portionGram);

    if (!trimmedTitle) {
      nextErrors.title = "Nama jadwal wajib diisi.";
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = "Nama jadwal minimal 3 karakter.";
    } else if (trimmedTitle.length > 32) {
      nextErrors.title = "Nama jadwal maksimal 32 karakter.";
    }

    if (!values.feedTime) {
      nextErrors.feedTime = "Waktu eksekusi wajib dipilih.";
    }

    if (values.portionGram === "" || Number.isNaN(numericPortion)) {
      nextErrors.portionGram = "Takaran pakan wajib diisi dengan angka.";
    } else if (numericPortion < 1) {
      nextErrors.portionGram = "Takaran minimal adalah 1 gram.";
    } else if (numericPortion > 50) {
      nextErrors.portionGram = "Takaran maksimal adalah 50 gram agar pakan tidak meluap.";
    }

    if (values.notes.length > 120) {
      nextErrors.notes = "Catatan maksimal 120 karakter.";
    }

    return nextErrors;
  };

  // Jalankan validasi real-time saat user mengetik
  const handleFieldChange = (field, value) => {
    const nextValues = {
      title,
      feedTime,
      portionGram,
      notes,
      [field]: value,
    };

    if (field === "title") setTitle(value);
    if (field === "feedTime") setFeedTime(value);
    if (field === "portionGram") setPortionGram(value);
    if (field === "notes") setNotes(value);

    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(nextValues));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate({ title, feedTime, portionGram, notes });
    setErrors(validationErrors);
    setTouched({ title: true, feedTime: true, portionGram: true, notes: true });

    if (Object.keys(validationErrors).length > 0) return;

    const grams = Number(portionGram);
    // Tentukan sudut dan durasi servo otomatis berdasarkan takaran gram
    const servoAngle = grams <= 5 ? "45°" : grams <= 20 ? "90°" : "135°";
    const servoDuration = grams <= 5 ? "0.8s" : grams <= 20 ? "1.5s" : "2.2s";

    onAddSchedule({
      id: `SLOT_${Date.now()}`,
      title: title.trim(),
      feedTime,
      portionGram: grams,
      servoAngle,
      servoDuration,
      notes: notes.trim(),
      notifyWebhook,
      isActive: true,
    });

    // Reset form setelah berhasil disimpan
    setTitle("");
    setPortionGram("15");
    setNotes("");
    setTouched({});
    setErrors({});
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const portionError = touched.portionGram && errors.portionGram;
  const hopperImpactPct = ((Number(portionGram || 0) / 2000) * 100).toFixed(2);

  return (
    <div className="bg-obsidian rounded-lg border border-ice/20 p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Header Form */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-ice/15">
        <div>
          <span className="font-mono text-[10px] text-ice-muted uppercase tracking-wider">
            SEC_REG_FORM_V3
          </span>
          <h2 className="text-lg font-medium text-ice-text tracking-tight">Formulir Jadwal Baru</h2>
          <p className="text-xs text-ice-muted mt-0.5">
            Parameter waktu RTC dan porsi gram dispenser servo.
          </p>
        </div>
        <span className="font-mono text-[10px] text-ice bg-surface-low px-2 py-1 rounded border border-ice/30 shrink-0">
          FORM_ID #04
        </span>
      </div>

      {/* Notifikasi Sukses Simpan */}
      {submitSuccess && (
        <div className="mt-4 bg-ice/10 border border-ice/40 rounded p-3 flex items-center gap-2 font-mono text-xs text-ice-light">
          <CheckCircle2 className="w-4 h-4 text-ice shrink-0" />
          <span>Jadwal berhasil ditulis ke memori EEPROM ESP32-C3!</span>
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
            <span className="text-[10px] text-ice-muted">VAR_STR({title.length}/32)</span>
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

        {/* Field 2: Waktu Eksekusi */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono">
            <label htmlFor="sched-time" className="text-[11px] text-ice-text uppercase tracking-wide">
              Waktu Eksekusi (WIB) <span className="text-ice">*</span>
            </label>
            <span className="text-[10px] text-ice-muted">RTC_24H_CLOCK</span>
          </div>
          <div className="relative flex items-center">
            <input
              id="sched-time"
              type="time"
              value={feedTime}
              onChange={(e) => handleFieldChange("feedTime", e.target.value)}
              className="w-full bg-[#030608] border border-ice/25 focus:border-ice rounded px-3 py-2 text-xs text-ice-text font-mono focus:outline-none transition-all pr-10"
            />
            <Clock className="w-4 h-4 absolute right-3 text-ice pointer-events-none" />
          </div>
          <p className="font-mono text-[10px] text-ice-muted">
            Format 24 jam tersinkron dengan NTP server
          </p>
        </div>

        {/* Field 3: Takaran Pakan (1–50 gram) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono">
            <label htmlFor="sched-portion" className="text-[11px] text-ice-text uppercase tracking-wide">
              Takaran Pakan (1–50 gram) <span className="text-ice">*</span>
            </label>
            <span className="text-[10px] text-ice-fixed font-semibold">MAX_DISPENSE: 50g</span>
          </div>

          <div className="relative">
            <input
              id="sched-portion"
              type="number"
              min="1"
              max="100"
              value={portionGram}
              onChange={(e) => handleFieldChange("portionGram", e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, portionGram: true }))}
              className={`w-full bg-[#030608] rounded px-3 py-2 text-lg font-semibold font-mono tracking-wider pr-14 focus:outline-none transition-all ${
                portionError
                  ? "border-2 border-dashed border-ice-fixed text-ice-light shadow-[inset_0_0_12px_rgba(186,230,253,0.12)]"
                  : "border border-ice/25 focus:border-ice text-ice-text"
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ice-fixed pointer-events-none">
              GRAM
            </span>
          </div>

          {/* Inline Validation Alert (Strictly Monochromatic Ice Blue) */}
          {portionError && (
            <div className="mt-1 bg-surface-low/80 border border-dashed border-ice-fixed/60 rounded p-2.5 flex items-start gap-2">
              <Info className="w-4 h-4 text-ice shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <p className="text-xs text-ice-light font-medium">{errors.portionGram}</p>
                <span className="font-mono text-[10px] text-ice-muted mt-0.5">
                  Kapasitas Hopper Terpakai: +{hopperImpactPct}% (Batas aman 50g / batch)
                </span>
              </div>
            </div>
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

        {/* Checkbox Webhook / Telegram */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={notifyWebhook}
            onChange={(e) => setNotifyWebhook(e.target.checked)}
            className="w-4 h-4 accent-[#7dd3fc] bg-pitch border-ice/50 rounded cursor-pointer"
          />
          <span className="text-xs text-ice-text">
            Kirim notifikasi Telegram / Webhook saat jadwal tereksekusi
          </span>
        </label>

        {/* Submit Button */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            className="w-full h-11 bg-ice hover:bg-ice-fixed active:scale-[0.99] text-black font-mono text-xs font-bold uppercase tracking-wider rounded border border-ice-fixed flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(125,211,252,0.25)] hover:shadow-[0_0_24px_rgba(125,211,252,0.45)] transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>Simpan Jadwal ke ESP32</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-center font-mono text-[10px] text-ice-muted">
            <Terminal className="w-3 h-3 shrink-0" />
            <span>Perintah akan ditulis ke slot memori EEPROM sektor 0x04F via REST API</span>
          </div>
        </div>
      </form>
    </div>
  );
}