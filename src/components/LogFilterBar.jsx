import { Search, Filter, ArrowUpDown, RotateCcw, Download } from "lucide-react";

export default function LogFilterBar({
  searchQuery = "",
  methodFilter = "ALL",
  statusFilter = "ALL",
  sortOrder = "newest",
  onUpdateParam,
  onReset,
  onExportJson,
}) {
  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    methodFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    sortOrder !== "newest";

  return (
    <section className="w-full bg-surface-low border border-ice/20 rounded-lg p-3.5 md:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      {/* Input Pencarian */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 text-ice absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onUpdateParam("q", e.target.value)}
          placeholder="Cari catatan atau ID log (contoh: pakan pagi, LOG-001)..."
          className="w-full bg-obsidian border border-ice/25 focus:border-ice rounded pl-9 pr-3 py-2 font-mono text-xs text-ice-text placeholder:text-ice-muted/60 focus:outline-none transition-colors"
        />
      </div>

      {/* Grup Filter, Sorting & Aksi */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter Metode */}
        <div className="relative min-w-[145px] flex-1 sm:flex-none">
          <select
            aria-label="Filter Metode"
            value={methodFilter}
            onChange={(e) => onUpdateParam("method", e.target.value)}
            className="w-full appearance-none bg-obsidian border border-ice/25 hover:border-ice/50 text-ice-text font-mono text-xs px-3 py-2 pr-8 rounded cursor-pointer focus:outline-none transition-colors"
          >
            <option value="ALL" className="bg-obsidian text-ice-text">
              Metode: Semua
            </option>
            <option value="Otomatis" className="bg-obsidian text-ice-text">
              Metode: Otomatis
            </option>
            <option value="Manual" className="bg-obsidian text-ice-text">
              Metode: Manual
            </option>
          </select>
          <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-ice pointer-events-none" />
        </div>

        {/* Filter Status */}
        <div className="relative min-w-[145px] flex-1 sm:flex-none">
          <select
            aria-label="Filter Status"
            value={statusFilter}
            onChange={(e) => onUpdateParam("status", e.target.value)}
            className="w-full appearance-none bg-obsidian border border-ice/25 hover:border-ice/50 text-ice-text font-mono text-xs px-3 py-2 pr-8 rounded cursor-pointer focus:outline-none transition-colors"
          >
            <option value="ALL" className="bg-obsidian text-ice-text">
              Status: Semua
            </option>
            <option value="Berhasil" className="bg-obsidian text-ice-text">
              Status: Berhasil
            </option>
            <option value="Terjadwal" className="bg-obsidian text-ice-text">
              Status: Terjadwal
            </option>
          </select>
          <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-ice pointer-events-none" />
        </div>

        {/* Dropdown Sorting */}
        <div className="relative min-w-[175px] flex-1 sm:flex-none">
          <select
            aria-label="Urutkan Riwayat"
            value={sortOrder}
            onChange={(e) => onUpdateParam("sort", e.target.value)}
            className="w-full appearance-none bg-obsidian border border-ice/25 hover:border-ice/50 text-ice-text font-mono text-xs px-3 py-2 pr-8 rounded cursor-pointer focus:outline-none transition-colors"
          >
            <option value="newest" className="bg-obsidian text-ice-text">
              Urutkan: Terbaru
            </option>
            <option value="oldest" className="bg-obsidian text-ice-text">
              Urutkan: Terlama
            </option>
            <option value="portion_desc" className="bg-obsidian text-ice-text">
              Takaran: Terbesar
            </option>
            <option value="portion_asc" className="bg-obsidian text-ice-text">
              Takaran: Terkecil
            </option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-ice pointer-events-none" />
        </div>

        {/* Tombol Reset */}
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilter}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-obsidian border border-ice/25 hover:border-ice/50 disabled:opacity-45 text-ice-muted hover:text-ice-light font-mono text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {/* Tombol Ekspor JSON */}
        <button
          type="button"
          onClick={onExportJson}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-obsidian border border-ice/35 hover:bg-ice/15 text-ice font-mono text-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>
      </div>
    </section>
  );
}