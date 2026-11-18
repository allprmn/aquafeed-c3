import { useState, useEffect } from "react";
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
  Thermometer,
  Package,
  Wifi,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { feederService, getAdjacentLogIds } from "../services/feederService";
import DetailMetricCard from "../components/DetailMetricCard";
import { LoadingSkeleton, ErrorState } from "../components/StateFeedback";

export default function HistoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feederService.getFeedingLogById(id);
      setLog(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Generate hash deterministik berdasarkan ID log untuk tampilan teknis
  const mockSha256 = log
    ? `e7c908f51dfb25690b8f047e0964177cf64b8a21f1d1f08a54e966f9${log.id.toLowerCase().replace("-", "")}`
    : "";

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(mockSha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!log) return;
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
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

  const { prevId, nextId } = getAdjacentLogIds(log.id);
  const hopperBefore = Math.min(100, log.feedRemainingPct + 2);
  const servoCycles = Math.max(1, Math.round(log.portionGram / 5));

  return (
    <div className="flex flex-col gap-5">
      {/* Top Breadcrumb & Back Navigation Bar */}
      <section className="bg-[#060A0D] border border-ice/20 rounded-lg px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/riwayat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-low border border-ice/30 text-ice hover:bg-ice/15 hover:text-ice-light transition-all font-mono text-[11px] tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>KEMBALI KE RIWAYAT</span>
          </Link>

          <div className="h-3.5 w-px bg-ice/20 hidden sm:block" />

          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-[10px] text-ice-muted">
            <Link to="/" className="hover:text-ice-light transition-colors">
              DASHBOARD
            </Link>
            <span>/</span>
            <Link to="/riwayat" className="hover:text-ice-light transition-colors">
              RIWAYAT_PAKAN
            </Link>
            <span>/</span>
            <span className="text-ice-light bg-ice/10 px-2 py-0.5 rounded border border-ice/30 text-[11px]">
              #{log.id}
            </span>
          </nav>
        </div>

        <span className="px-2.5 py-1 rounded bg-surface-low border border-ice/15 font-mono text-[10px] text-ice/90">
          TRANSACTION_ID: 0x8F4A2B // EEPROM_SECTOR_0x04
        </span>
      </section>

      {/* Detail Header Hero Panel */}
      <section className="bg-[#060A0D] border border-ice/20 rounded-lg p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-ice/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ice/15 pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-mono text-[10px] text-ice-muted tracking-wider">
              <span className="inline-block w-1.5 h-1.5 bg-ice" />
              <span>LOG_ID // HISTORICAL_DISPENSE_RECORD</span>
              <span>::</span>
              <span className="text-ice/80">CHECKSUM_VALID</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <h1 className="text-2xl md:text-3xl font-semibold text-ice-text tracking-tight">
                Detail Eksekusi <span className="font-mono text-ice-light font-normal">#{log.id}</span>
              </h1>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ice/10 border border-ice/40 text-ice font-mono text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-ice" />
                </span>
                <span className="uppercase tracking-wide">SELESAI • {log.status}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-ice-muted font-mono text-[11px] mt-1">
              <span className="inline-flex items-center gap-1.5 text-ice">
                <Clock className="w-3.5 h-3.5" />
                <span>{log.timeLabel}</span>
              </span>
              <span>•</span>
              <span>{log.dateText} (NTP Synchronized)</span>
              <span>•</span>
              <span>UPTIME: 312h 14m 02s</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-surface-low border border-ice/20 text-ice-light hover:border-ice/50 hover:bg-ice/10 transition-all font-mono text-[10px] uppercase tracking-wider cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-ice" /> : <Fingerprint className="w-3.5 h-3.5 text-ice" />}
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

        {/* Hash Tape */}
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2 bg-[#030608] px-3.5 py-2 rounded border border-ice/10 font-mono text-[10px] text-ice-muted">
          <div className="flex items-center gap-2 truncate min-w-0">
            <span className="text-ice/80 shrink-0">BLOCK_HASH:</span>
            <span className="truncate text-ice-text/80">{mockSha256}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-ice/70">
            <span>PACKET_SEQ: #49102</span>
            <span>CRC32: 0x9B41AF0E</span>
          </div>
        </div>
      </section>

      {/* 2x3 Structured Telemetry & Hardware Actuator Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Metode Pemicu */}
        <DetailMetricCard
          code="TRIGGER_VECTOR"
          title="Metode Pemicu"
          icon={RefreshCw}
          footerLeft={log.method === "Otomatis" ? "CRON_TARGET: NTP_AUTO" : "HTTP_POST: WEB_CLIENT"}
          footerRight={log.method === "Otomatis" ? "Slot #01 • Auto" : "Manual Trigger"}
        >
          <div className="text-lg font-semibold text-ice-text tracking-tight">
            {log.method === "Otomatis" ? "Penjadwalan Otomatis" : "Kontrol Manual Web UI"}
          </div>
          <div className="font-mono text-[10px] text-ice mt-1">
            {log.method === "Otomatis"
              ? "NTP Server Pool Sync (asia.pool.ntp.org)"
              : "Perintah langsung dari browser pengguna"}
          </div>
        </DetailMetricCard>

        {/* Card 2: Takaran Pakan Keluar */}
        <DetailMetricCard
          code="DISPENSED_MASS"
          title="Takaran Pakan Keluar"
          icon={Scale}
          footerLeft={`TARGET: ${log.portionGram}g`}
          footerRight={`NET: ${log.portionGram}.00g (Akurat)`}
        >
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-semibold text-ice-light">{log.portionGram.toFixed(1)}</span>
            <span className="text-xs text-ice-text">gram</span>
            <span className="text-[10px] text-ice-muted">({servoCycles} siklus)</span>
          </div>
          <div className="w-full h-1.5 bg-surface-low rounded-full overflow-hidden mt-2.5">
            <div className="h-full bg-ice rounded-full w-full" />
          </div>
        </DetailMetricCard>

        {/* Card 3: Durasi & Sudut Servo */}
        <DetailMetricCard
          code="SERVO_PWM_ACTUATOR"
          title="Durasi & Sudut Servo"
          icon={Activity}
          footerLeft="PWM: 50Hz (20ms)"
          footerRight="GPIO 4 • Detached"
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

        {/* Card 4: Suhu Air Saat Eksekusi */}
        <DetailMetricCard
          code="AQUARIUM_TEMP_DS18B20"
          title="Suhu Air Akuarium"
          icon={Thermometer}
          footerLeft="RANGE: 24.0°C - 30.0°C"
          footerRight="STABIL_OPTIMAL"
        >
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-semibold text-ice-light">{log.waterTemp}</span>
            <span className="text-xs text-ice-text">°C</span>
            <span className="text-[10px] text-ice border border-ice/30 px-1.5 py-0.5 rounded uppercase">
              Optimal
            </span>
          </div>
          <div className="font-mono text-[10px] text-ice-muted mt-1">
            Sensor DS18B20 Waterproof • Stabilitas termal terjaga
          </div>
        </DetailMetricCard>

        {/* Card 5: Perubahan Kapasitas Wadah */}
        <DetailMetricCard
          code="HOPPER_CAPACITY"
          title="Perubahan Kapasitas Wadah"
          icon={Package}
          footerLeft={`ESTIMASI: ${log.feedRemainingKg}`}
          footerRight="Sensor Level Valid"
        >
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-semibold text-ice-text">{hopperBefore}%</span>
            <span className="text-ice">→</span>
            <span className="text-3xl font-semibold text-ice-light">{log.feedRemainingPct}%</span>
            <span className="text-[10px] text-ice-muted">(-2%)</span>
          </div>
          <div className="font-mono text-[10px] text-ice-muted mt-1">
            Sisa volume hopper pakan kering setelah eksekusi
          </div>
        </DetailMetricCard>

        {/* Card 6: Latensi & Sinyal ESP32 */}
        <DetailMetricCard
          code="RF_TELEMETRY"
          title="Latensi & Sinyal ESP32-C3"
          icon={Wifi}
          footerLeft="SSID: AquaFeed_IoT"
          footerRight="WiFi 802.11 b/g/n"
        >
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-semibold text-ice-light">{log.latencyMs}</span>
            <span className="text-xs text-ice-text">ms</span>
            <span className="text-ice-muted">•</span>
            <span className="text-3xl font-semibold text-ice-text">{log.rssi.replace(" dBm", "")}</span>
            <span className="text-[10px] text-ice">dBm</span>
          </div>
          <div className="font-mono text-[10px] text-ice-muted mt-1">
            HTTPS REST API Sync • 0 Packet Lost
          </div>
        </DetailMetricCard>
      </section>

      {/* Catatan Sistem & UART Serial Monitor */}
      <section className="bg-[#060A0D] border border-ice/20 rounded-lg p-5 md:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ice/15 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-ice" />
            <h2 className="text-base font-semibold text-ice-text tracking-tight">
              Catatan Sistem & Observasi Aktuator
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-ice-muted">
            <span className="w-2 h-2 rounded-full bg-ice" />
            <span>DRIVER: ESP32-LEDC-PWM-CH0</span>
          </div>
        </div>

        {/* Observasi Catatan Log */}
        <div className="bg-[#030608] border border-ice/15 rounded-lg p-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-ice">
            <span className="uppercase tracking-wider">SUPERVISOR_NOTE // DISPENSE_CYCLE_FEEDBACK</span>
            <span className="text-ice-muted">STAGE: COMPLETED_WITHOUT_FAULT</span>
          </div>
          <p className="text-ice-text text-sm leading-relaxed">
            {log.notes} Katup servo kembali ke posisi tertutup (<span className="font-mono text-ice-light">0°</span>) dan sinyal PWM otomatis dilepas (<span className="font-mono text-ice-light">SERVO_DETACHED</span>) agar motor tetap dingin.
          </p>
        </div>

        {/* Monospace UART Terminal Stream */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-ice-muted font-mono text-[10px]">
            <span>UART0_SERIAL_MONITOR_RAW (Baud: 115200 8-N-1)</span>
            <span className="text-ice">SYNCHRONIZED_WITH_CLOUD_LOG</span>
          </div>

          <div className="w-full bg-pitch border border-ice/25 rounded p-3.5 font-mono text-[11px] flex flex-col gap-1.5 overflow-x-auto text-ice-text leading-5">
            <div className="flex items-baseline gap-2 text-ice-muted">
              <span className="shrink-0">[00:00.010]</span>
              <span className="text-ice shrink-0">TRIGGER_SRC:</span>
              <span>Event #{log.id} initiated via {log.method.toUpperCase()} mode.</span>
            </div>
            <div className="flex items-baseline gap-2 bg-ice/[0.03] py-0.5 rounded">
              <span className="text-ice-muted shrink-0">[00:00.025]</span>
              <span className="text-ice shrink-0">SERVO_SG90:</span>
              <span>Attached GPIO 4 (50Hz). Rotating flap 0° → {log.servoAngle} for {log.servoDurationMs}ms.</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-ice-muted shrink-0">[00:{(log.servoDurationMs / 1000).toFixed(2)}s]</span>
              <span className="text-ice shrink-0">HOPPER_VALVE:</span>
              <span className="text-ice-light">
                Dispensed {log.portionGram}.0g payload ({servoCycles} cycles). Remaining: {log.feedRemainingPct}%.
              </span>
            </div>
            <div className="flex items-baseline gap-2 bg-ice/[0.03] py-0.5 rounded">
              <span className="text-ice-muted shrink-0">[00:{((log.servoDurationMs + 300) / 1000).toFixed(2)}s]</span>
              <span className="text-ice shrink-0">SERVO_SG90:</span>
              <span>Returned to 0° and detached PWM signal (Idle current: 0mA).</span>
            </div>
            <div className="flex items-baseline gap-2 text-ice-muted">
              <span className="shrink-0">[00:{((log.servoDurationMs + 350) / 1000).toFixed(2)}s]</span>
              <span className="text-ice-light shrink-0">REST_POST:</span>
              <span>Telemetry pushed to Supabase ({log.latencyMs}ms • HTTP 201 Created).</span>
            </div>
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