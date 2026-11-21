import { Link } from "react-router-dom";
import { RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import { useFeederLogs } from "../hooks/useFeederLogs";
import LogFilterBar from "../components/LogFilterBar";
import Pagination from "../components/Pagination";
import { LoadingSkeleton, ErrorState, EmptyState } from "../components/StateFeedback";

const ITEMS_PER_PAGE = 6;

export default function HistoryPage() {
  const {
    logs,
    filteredLogs,
    totalItems,
    totalCached,
    isLoading,
    error,
    refetch,
    searchQuery,
    methodFilter,
    statusFilter,
    sortOrder,
    currentPage,
    totalPages,
    updateParam,
    resetAllFilters,
  } = useFeederLogs(ITEMS_PER_PAGE);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aquafeed-c3-feed-logs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-ice/15 pb-4">
        <div className="flex flex-col gap-1">
          
          <h1 className="text-2xl md:text-3xl font-semibold text-ice-light tracking-tight">
            Riwayat Pemberian Pakan
          </h1>
          <p className="text-xs md:text-sm text-ice-muted max-w-2xl">
            Data historis eksekusi servo mikro-dispenser, rotasi katup pakan, dan log jadwal otomatis via REST API endpoint.
          </p>
        </div>

        {/* Status Sync & Tombol Uji Simulasi Error */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => refetch({ simulateError: true })}
            title="Uji tampilan Error State API"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-obsidian border border-dashed border-ice/30 hover:border-ice text-ice-muted hover:text-ice-light rounded font-mono text-[10px] transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-ice" />
            <span>Simulasi Error</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-obsidian border border-ice/25 rounded font-mono text-[11px]">
            <RefreshCw className={`w-3.5 h-3.5 text-ice ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-ice-light">{error ? "SYNC_ERR" : "SYNC_STATUS: 200 OK"}</span>
            <span className="text-ice-muted">•</span>
            <span className="text-ice-muted">{totalCached} RECORD CACHED</span>
          </div>
        </div>
      </header>

      {/* Toolbar Search, Filter & Sorting */}
      <LogFilterBar
        searchQuery={searchQuery}
        methodFilter={methodFilter}
        statusFilter={statusFilter}
        sortOrder={sortOrder}
        onUpdateParam={updateParam}
        onReset={resetAllFilters}
        onExportJson={handleExportJson}
      />

      {/* Kontainer Data Utama (Loading / Error / Empty / Table) */}
      <section className="w-full bg-surface-low border border-ice/20 rounded-lg overflow-hidden flex flex-col">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => refetch()} />
        ) : logs.length === 0 ? (
          <EmptyState onReset={resetAllFilters} />
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-ice/15 bg-obsidian/70 text-ice-muted font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">ID Log</th>
                    <th className="py-3 px-4">Waktu Eksekusi</th>
                    <th className="py-3 px-4">Metode</th>
                    <th className="py-3 px-4">Takaran & Sudut</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice/10 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-ice/[0.03] transition-colors group">
                      <td className="py-3.5 px-4 font-mono text-ice font-medium">#{log.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-ice-light font-medium">{log.timeLabel}</span>
                          <span className="font-mono text-[10px] text-ice-muted">{log.dateText}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {log.method === "Otomatis" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-ice bg-ice/10 border border-ice/30 font-mono text-[10px] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-ice" />
                            Otomatis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-ice-light border border-ice/40 bg-obsidian font-mono text-[10px] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full border border-ice" />
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-ice-light font-semibold">{log.portionGram} gram</span>{" "}
                        <span className="text-[11px] text-ice-muted">({log.servoAngle})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] uppercase border ${
                            log.status === "Berhasil"
                              ? "border-ice/40 text-ice bg-ice/5"
                              : "border-dashed border-ice-muted/50 text-ice-muted bg-obsidian"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/riwayat/${log.id}`}
                          className="font-mono text-xs text-ice hover:text-ice-light transition-all inline-flex items-center gap-1 group-hover:translate-x-0.5"
                        >
                          <span>Detail</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => updateParam("page", page)}
            />
          </>
        )}
      </section>
    </div>
  );
}