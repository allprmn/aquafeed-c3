import { useState } from "react";
import { SlidersHorizontal, RotateCw, UtensilsCrossed, Clock, Loader2, CheckCircle2 } from "lucide-react";

const PORTION_OPTIONS = [
  { grams: 5, label: "Kecil (5g)", angle: "45°", duration: "0.8 detik", duty: "5.2% (1040µs)" },
  { grams: 10, label: "Sedang (10g)", angle: "90°", duration: "1.5 detik", duty: "7.5% (1500µs)" },
  { grams: 15, label: "Besar (15g)", angle: "135°", duration: "2.2 detik", duty: "9.8% (1960µs)" },
];

export default function ManualFeedCard({ onTriggerFeed, lastFedText }) {
  // Local State untuk pilihan takaran & status tombol kirim
  const [selectedPortion, setSelectedPortion] = useState(PORTION_OPTIONS[1]);
  const [feedState, setFeedState] = useState("idle"); // 'idle' | 'sending' | 'success'

  const handleDispense = async () => {
    if (feedState !== "idle") return;
    setFeedState("sending");

    // Simulasi jeda pengiriman sinyal ke ESP32-C3 (nanti diganti request Supabase)
    setTimeout(() => {
      if (onTriggerFeed) {
        onTriggerFeed(selectedPortion);
      }
      setFeedState("success");

      setTimeout(() => {
        setFeedState("idle");
      }, 1800);
    }, 1000);
  };

  return (
    <div className="lg:col-span-7 bg-obsidian border border-ice/20 rounded-lg p-6 flex flex-col justify-between">
      <div className="flex flex-col gap-5">
        {/* Header Kartu */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block font-mono text-[10px] text-ice bg-ice/10 border border-ice/30 px-2 py-0.5 rounded tracking-wider mb-1.5">
              MANUAL_PWM_TRIGGER
            </span>
            <h2 className="text-lg font-medium text-ice-text">Kontrol Pemberian Pakan Langsung</h2>
            <p className="text-xs text-ice-muted mt-0.5">
              Kirim perintah PWM langsung ke Servo SG90 via ESP32-C3 SuperMini
            </p>
          </div>
         
        </div>

        {/* Pilihan Takaran Pakan */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] text-ice-muted uppercase tracking-wider">
            PILIH TAKARAN PAKAN (SERVO OPENING)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {PORTION_OPTIONS.map((option) => {
              const isSelected = selectedPortion.grams === option.grams;
              return (
                <button
                  key={option.grams}
                  type="button"
                  onClick={() => setSelectedPortion(option)}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded font-mono transition-all cursor-pointer ${
                    isSelected
                      ? "bg-ice text-black font-semibold shadow-[0_0_16px_rgba(125,211,252,0.35)] border border-ice"
                      : "bg-surface-low border border-ice/20 text-ice-muted hover:text-ice-light hover:border-ice/50"
                  }`}
                >
                  <span className="text-xs">{option.label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? "text-black/80 font-normal" : "text-ice-muted/80"}`}>
                    Angle {option.angle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Sudut & Duty Cycle */}
        <div className="bg-surface-low/80 border border-ice/15 rounded px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-ice-text">
             
            <span>
              Sudut Flap: <span className="text-ice font-medium">{selectedPortion.angle}</span> • Durasi Buka:{" "}
              <span className="text-ice font-medium">{selectedPortion.duration}</span>
            </span>
          </div>
          <span className="text-ice-muted">DUTY: {selectedPortion.duty}</span>
        </div>

        {/* Tombol Eksekusi Utama */}
        <button
          type="button"
          onClick={handleDispense}
          disabled={feedState !== "idle"}
          className="w-full py-3.5 px-4 bg-ice text-black font-mono text-xs font-bold uppercase tracking-wider rounded border border-ice-fixed shadow-[0_0_24px_rgba(125,211,252,0.35)] hover:bg-ice-fixed active:scale-[0.99] disabled:opacity-80 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {feedState === "idle" && (
            <>
              <UtensilsCrossed className="w-4 h-4" />
              <span>Beri Makan Sekarang</span>
            </>
          )}
          {feedState === "sending" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mengirim Perintah PWM...</span>
            </>
          )}
          {feedState === "success" && (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Pakan Dikeluarkan (OK)</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Status Terakhir */}
      <div className="mt-5 pt-3 border-t border-ice/15 flex items-center gap-2 font-mono text-[11px] text-ice-muted">
        <Clock className="w-3.5 h-3.5 text-ice shrink-0" />
        <span>
          Terakhir diberi makan: <span className="text-ice-light">{lastFedText}</span> • Respon Motor:{" "}
          <span className="text-ice">18ms</span>
        </span>
      </div>
    </div>
  );
}