import { SearchX, FilterX, WifiOff, RefreshCw } from "lucide-react";

export function LoadingSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-ice/10 pb-3 font-mono text-[11px]">
        <div className="flex items-center gap-2 text-ice-light">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ice" />
          </span>
          <span>STATE: ASYNC_FETCHING • Memuat log telemetri...</span>
        </div>
        <span className="text-ice-muted">GET /rest/v1/feeding_logs</span>
      </div>

      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="h-11 w-full bg-obsidian border border-ice/10 rounded animate-pulse flex items-center px-4 gap-4">
            <div className="h-3 w-16 bg-ice/15 rounded" />
            <div className="h-3 w-36 bg-ice/10 rounded" />
            <div className="h-4 w-20 bg-ice/15 rounded" />
            <div className="h-3 w-24 bg-ice/10 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-ice/10 border border-ice-fixed/40 flex items-center justify-center text-ice-fixed">
        <WifiOff className="w-6 h-6" />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
        <h3 className="text-base font-medium text-ice-light">Gagal Mengambil Data API</h3>
        <p className="text-xs text-ice-muted font-mono">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 px-4 py-2 bg-ice text-black font-mono text-xs font-semibold rounded flex items-center gap-1.5 hover:bg-ice-fixed transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Muat Ulang Data</span>
      </button>
    </div>
  );
}

export function EmptyState({ onReset }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-ice/5 border border-ice/20 flex items-center justify-center text-ice">
        <SearchX className="w-6 h-6" />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="text-base font-medium text-ice-light">Tidak ada log yang cocok</h3>
        <p className="text-xs text-ice-muted">
          Parameter pencarian atau filter aktif tidak menemukan kecocokan di database log ESP32-C3.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-1 px-4 py-2 bg-obsidian border border-ice/30 hover:border-ice text-ice hover:text-ice-light font-mono text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <FilterX className="w-3.5 h-3.5" />
        <span>Reset Opsi Filter</span>
      </button>
    </div>
  );
}