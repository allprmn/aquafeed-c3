import { Link } from "react-router-dom";
import { History, ArrowRight, Terminal } from "lucide-react";

export default function RecentActivityTable({ logs = [] }) {
  const latest = logs[0];

  return (
    <section className="bg-obsidian border border-ice/20 rounded-lg p-5 md:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ice/15">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-surface-low border border-ice/20 text-ice">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-ice-text">Aktivitas Pakan Terbaru</h3>
            <p className="font-mono text-[11px] text-ice-muted">
              Riwayat {logs.length} pengeluaran pakan terakhir dari database
            </p>
          </div>
        </div>

        <Link
          to="/riwayat"
          className="font-mono text-xs text-ice hover:underline flex items-center gap-1 transition-all self-start sm:self-auto"
        >
          <span>Lihat Semua Riwayat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left font-mono border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-ice/15 text-ice-muted text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Waktu & Batch</th>
              <th className="py-2.5 px-3">Metode</th>
              <th className="py-2.5 px-3">Takaran</th>
              <th className="py-2.5 px-3">Latensi ESP32</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ice/10 text-xs">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ice-muted">
                  Belum ada aktivitas pemberian pakan tercatat.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-ice/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="text-ice-text font-medium">{log.time}</span>
                      <span className="text-[10px] text-ice-muted">{log.batch}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] border ${
                        log.method.includes("Manual")
                          ? "bg-ice/20 border-ice-fixed text-ice-text"
                          : "bg-ice/10 border-ice/30 text-ice-fixed"
                      }`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-ice-text">{log.portion}</td>
                  <td className="py-3 px-3 text-ice-muted">{log.latency}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] border border-ice/40 text-ice bg-ice/5">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Log Serial UART Dinamis */}
      <div className="bg-surface-low/60 rounded border border-ice/15 px-3 py-2 flex items-center justify-between font-mono text-[10px] text-ice-muted">
        <div className="flex items-center gap-2 truncate">
          <Terminal className="w-3.5 h-3.5 text-ice shrink-0" />
          <span className="truncate">
            {latest
              ? `LAST_EXEC: [${latest.code}] ${latest.portion} • DURASI ${latest.durationMs}ms @ GPIO4 >> ${latest.status}`
              : "UART_RX: [ESP32-C3] SG90_SERVO_IDLE @ GPIO4 >> STANDBY"}
          </span>
        </div>
        <span className="text-ice/70 hidden sm:inline shrink-0">BAUD: 115200</span>
      </div>
    </section>
  );
}