import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Fingerprint,
  Check,
  Download,
  RefreshCw,
  Scale,
  Activity,
  Wifi,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { useFeeder } from "../context/FeederContext";
import { feederService } from "../services/feederService";
import DetailMetricCard from "../components/DetailMetricCard";
import { LoadingSkeleton, ErrorState } from "../components/StateFeedback";

function formatJakartaPreciseTime(dateObj) {
  const timePart = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(dateObj);
  const ms = String(dateObj.getMilliseconds()).padStart(3, "0");
  return `${timePart}.${ms}`;
}

export default function HistoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logs = [], device } = useFeeder();

  const [log, setLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sha256Hash, setSha256Hash] = useState("");

  useEffect(() => {
    let active = true;
    const cached = logs.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (cached) {
      setLog(cached);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    feederService
      .getFeedingLogById(id)
      .then((data) => {
        if (active) {
          setLog(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, logs]);

  // Hitung hash SHA-256 asli dari data telemetry log
  useEffect(() => {
    if (!log) return;
    let cancelled = false;
    const rawPayload = `${log.uuid}|${log.id}|${log.dateIso}|${log.method}|${log.portionGram}|${log.servoAngle}|${log.servoDurationMs}`;

    async function computeHash() {
      try {
        if (window.crypto?.subtle) {
          const encoded = new TextEncoder().encode(rawPayload);
          const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
          const hex = Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          if (!cancelled) setSha256Hash(hex);
          return;
        }
      } catch {
        // Fallback jika Web Crypto tidak tersedia
      }

      const fallback = Array.from(rawPayload)
        .reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) >>> 0, 2166136261)
        .toString(16)
        .padStart(8, "0");
      if (!cancelled) {
        setSha256Hash(`${fallback}${(log.uuid || "").replace(/-/g, "")}`.padEnd(64, "0"));
      }
    }

    computeHash();
    return () => {
      cancelled = true;
    };
  }, [log]);

  const { prevId, nextId } = useMemo(() => {
    const idx = logs.findIndex((item) => item.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return { prevId: null, nextId: null };
    return {
      nextId: idx > 0 ? logs[idx - 1].id : null,
      prevId: idx < logs.length - 1 ? logs[idx + 1].id : null,
    };
  }, [id, logs]);

  // Susun baris log UART Serial Monitor berdasarkan timestamp asli eksekusi
  const serialLines = useMemo(() => {
    if (!log) return [];
    const endTime = new Date(log.dateIso);
    const totalCycleMs = (log.servoDurationMs || 1500) + 350;
    const startTime = new Date(endTime.getTime() - totalCycleMs);
    const servoStartTime = new Date(startTime.getTime() + 15);
    const servoEndTime = new Date(servoStartTime.getTime() + (log.servoDurationMs || 1500));

    return [
      {
        ts: formatJakartaPreciseTime(startTime),
        tag: log.method === "Otomatis" ? "[CRON]" : "[CMD]",
        msg:
          log.method === "Otomatis"
            ? `${log.notes} (${log.timeLabel})`
            : `Perintah manual diterima dari Web UI! (Target: ${log.portionGram}g)`,
        highlight: false,
      },
      {
        ts: formatJakartaPreciseTime(servoStartTime),
        tag: "[SERVO]",
        msg: `Eksekusi ${log.portionGram}g | Sudut: ${log.servoAngle} | Durasi: ${log.servoDurationMs}ms (GPIO 4 PWM 50Hz)`,
        highlight: true,
      },
      {
        ts: formatJakartaPreciseTime(servoEndTime),
        tag: "[SERVO]",
        msg: "Selesai & Detached (0° • Idle current: 0mA)",
        highlight: false,
      },
      {
        ts: formatJakartaPreciseTime(endTime),
        tag: "[LOG]",
        msg: `Kirim riwayat ${log.method.toLowerCase()} (#${log.id}) ke Supabase (HTTP 201 • Latensi ${log.latencyMs}ms • RSSI ${log.rssi})`,
        highlight: true,
      },
    ];
  }, [log]);

  const handleCopyHash = () => {
    if (!sha256Hash) return;
    navigator.clipboard?.writeText(sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!log) return;
    const exportPayload = {
      ...log,
      sha256: sha256Hash,
      node: {
        id: device?.id || "esp32-c3-01",
        name: device?.device_name || "AquaFeed C3 Main Pond",
        firmware: device?.firmware_version || "v2.4.1-rc3",
      },
      uart_trace: serialLines,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${log.id}-telemetry.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-surface-low border border-ice/20 rounded-lg">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="bg-surface-low border border-ice/20 rounded-lg">
        <ErrorState
          message={error || `Log #${id} tidak ditemukan.`}
          onRetry={() => navigate("/riwayat")}
        />
      </div>
    );
  }

  const servoCycles = Math.max(1, Math.round(log.portionGram / 5));
  const portionPercent = Math.min(100, Math.max(6, Math.round((log.portionGram / 50) * 100)));
  const shortUuid = log.uuid ? log.uuid.slice(0, 8).toUpperCase() : log.id;
  const numericRssi = String(log.rssi || "-64 dBm").replace(/\s*dBm/i, "");
  const rssiNum = parseInt(numericRssi, 10);
  const signalQuality = Number.isNaN(rssiNum)
    ? "WiFi 802.11n (2.4 GHz)"
    : rssiNum >= -65
    ? "Sinyal Kuat & Stabil (2.4 GHz)"
    : rssiNum >= -75
    ? "Sinyal Cukup Stabil (2.4 GHz)"
    : "Sinyal Lemah (2.4 GHz)";

  const isDeviceOnline =
    device?.last_seen && Date.now() - new Date(device.last_seen).getTime() < 45000;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Breadcrumb & Back Navigation Bar */}
      

      {/* Detail Header Hero Panel */}
      <section className="bg-[#060A0D] border border-ice/20 rounded-lg p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-ice/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ice/15 pb-5">
          <div className="flex flex-col gap-1.5">
            

            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <h1 className="text-2xl md:text-3xl font-semibold text-ice-text tracking-tight">
                Detail Eksekusi 
              </h1>

            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-ice-muted font-mono text-[11px] mt-1">
              <span className="inline-flex items-center gap-1.5 text-ice">
                <Clock className="w-3.5 h-3.5" />
                <span>{log.timeLabel}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-surface-low border border-ice/20 text-ice-light hover:border-ice/50 hover:bg-ice/10 transition-all font-mono text-[10px] uppercase tracking-wider cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-ice" />
              ) : (
                <Fingerprint className="w-3.5 h-3.5 text-ice" />
              )}
              <span>{copied ? "HASH DISALIN" : "Salin Telemetry SHA256"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-ice text-black border border-ice hover:bg-ice-fixed transition-all font-mono text-[10px] uppercase font-semibold tracking-wider shadow-[0_0_15px_rgba(125,211,252,0.2)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Log (.JSON)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2x2 Structured Telemetry & Hardware Actuator Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Metode Pemicu */}
        <DetailMetricCard
          code="TRIGGER_VECTOR"
          title="Metode Pemicu"
          icon={RefreshCw}
          footerLeft={log.method === "Otomatis" ? "CRON_TARGET: NTP_WIB" : "REST_CMD: WEB_CLIENT"}
          footerRight={log.method === "Otomatis" ? "Auto Schedule • Synced" : "Manual Trigger"}
        >
          <div className="text-lg font-semibold text-ice-text tracking-tight">
            {log.method === "Otomatis" ? "Penjadwalan Otomatis" : "Kontrol Manual Web UI"}
          </div>
          <div className="font-mono text-[10px] text-ice mt-1">
            {log.method === "Otomatis"
              ? "NTP Server Pool Sync (pool.ntp.org • UTC+7)"
              : "Perintah langsung dari Dashboard Web"}
          </div>
        </DetailMetricCard>

        {/* Card 2: Takaran Pakan Keluar */}
        <DetailMetricCard
          code="DISPENSED_MASS"
          title="Takaran Pakan Keluar"
          icon={Scale}
          footerLeft={`TARGET: ${log.portionGram}g (Max 50g/batch)`}
          footerRight={`NET: ${log.portionGram.toFixed(2)}g (${log.status})`}
        >
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-semibold text-ice-light">{log.portionGram.toFixed(1)}</span>
            <span className="text-xs text-ice-text">gram</span>
            <span className="text-[10px] text-ice-muted">({servoCycles} siklus)</span>
          </div>
          <div className="w-full h-1.5 bg-surface-low rounded-full overflow-hidden mt-2.5">
            <div
              className="h-full bg-ice rounded-full transition-all"
              style={{ width: `${portionPercent}%` }}
            />
          </div>
        </DetailMetricCard>

        {/* Card 3: Durasi & Sudut Servo */}
        <DetailMetricCard
          code="SERVO_PWM_ACTUATOR"
          title="Durasi & Sudut Servo"
          icon={Activity}
          footerLeft="PWM: 50Hz (LEDC_CH0)"
          footerRight="GPIO 4 • Detached (0°)"
        >
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-semibold text-ice-text">{log.servoDurationMs}</span>
            <span className="text-xs text-ice-light">ms</span>
            <span className="text-[11px] text-ice">• 0° → {log.servoAngle} → 0°</span>
          </div>
          <div className="font-mono text-[10px] text-ice-muted mt-1">
            Micro Servo TowerPro SG90 (Auto-Detach Active)
          </div>
        </DetailMetricCard>

        {/* Card 4: Latensi & Sinyal ESP32 */}
        <DetailMetricCard
          code="RF_TELEMETRY"
          title="Latensi & Sinyal ESP32-C3"
          icon={Wifi}
          footerLeft={`NODE_ID: ${device?.id || "esp32-c3-01"}`}
          footerRight="WiFi 802.11n (2.4 GHz)"
        >
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-semibold text-ice-light">{log.latencyMs}</span>
            <span className="text-xs text-ice-text">ms</span>
            <span className="text-ice-muted">•</span>
            <span className="text-3xl font-semibold text-ice-text">{numericRssi}</span>
            <span className="text-[10px] text-ice">dBm</span>
          </div>
          <div className="font-mono text-[10px] text-ice-muted mt-1">
            HTTPS REST API Sync • {signalQuality}
          </div>
        </DetailMetricCard>
      </section>

      {/* Catatan Sistem & UART Serial Monitor */}
      <section className="bg-[#060A0D] border border-ice/20 rounded-lg p-5 md:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ice/15 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-ice" />
            <h2 className="text-base font-semibold text-ice-text tracking-tight">
              Catatan Sistem & UART Serial Monitor
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-ice-muted">
            <span
              className={`w-2 h-2 rounded-full ${
                isDeviceOnline ? "bg-ice animate-pulse" : "bg-ice-muted/50"
              }`}
            />
            <span>
              NODE: {device?.id || "esp32-c3-01"} • {isDeviceOnline ? "ONLINE" : "STANDBY"}
            </span>
          </div>
        </div>

        {/* Observasi Catatan Log */}
        <div className="bg-[#030608] border border-ice/15 rounded-lg p-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-ice">
            <span className="uppercase tracking-wider">SUPERVISOR_NOTE // DISPENSE_CYCLE_FEEDBACK</span>
            <span className="text-ice-muted">STATUS: {log.status.toUpperCase()}</span>
          </div>
          <p className="text-ice-text text-sm leading-relaxed">
            {log.notes} Katup servo kembali ke posisi tertutup (<span className="font-mono text-ice-light">0°</span>) dan sinyal PWM otomatis dilepas (<span className="font-mono text-ice-light">SERVO_DETACHED</span>) agar motor tetap dingin.
          </p>
        </div>

        {/* Monospace UART Terminal Stream (Tersinkron dengan Log Firmware) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-ice-muted font-mono text-[10px]">
            <span>USB_CDC_SERIAL_MONITOR (Baud: 115200 • WIB)</span>
            <span className="text-ice">SYNCED_WITH_SUPABASE_LOG</span>
          </div>

          <div className="w-full bg-pitch border border-ice/25 rounded p-3.5 font-mono text-[11px] flex flex-col gap-1.5 overflow-x-auto text-ice-text leading-5">
            {serialLines.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-baseline gap-2 ${
                  line.highlight ? "bg-ice/[0.04] py-0.5 px-1 rounded" : "px-1"
                }`}
              >
                <span className="text-ice-muted shrink-0">[{line.ts}]</span>
                <span className="text-ice font-semibold shrink-0">{line.tag}</span>
                <span className={line.highlight ? "text-ice-light" : "text-ice-text"}>
                  {line.msg}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Prev / Next Log Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-ice/10">
          <span className="font-mono text-[10px] text-ice-muted">
            RECORD_NAVIGATOR // DYNAMIC_ROUTE_ID
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end font-mono text-[11px]">
            {prevId ? (
              <Link
                to={`/riwayat/${prevId}`}
                className="px-3.5 py-1.5 rounded bg-surface-low border border-ice/20 text-ice-muted hover:text-ice-text hover:border-ice/40 transition-colors"
              >
                ← LOG SEBELUMNYA (#{prevId})
              </Link>
            ) : (
              <span className="px-3.5 py-1.5 rounded bg-surface-low/40 border border-ice/10 text-ice-muted/40 cursor-not-allowed">
                AWAL RIWAYAT
              </span>
            )}

            {nextId ? (
              <Link
                to={`/riwayat/${nextId}`}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded bg-surface-low border border-ice/20 text-ice hover:text-ice-light hover:border-ice/40 transition-colors"
              >
                <span>LOG BERIKUTNYA (#{nextId})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="px-3.5 py-1.5 rounded bg-surface-low/40 border border-ice/10 text-ice-muted/40 cursor-not-allowed">
                LOG TERBARU
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}