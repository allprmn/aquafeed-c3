import { useState, useEffect } from "react";
import { Search, ChevronDown, ArrowUpDown, RotateCcw, Download } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

export default function LogFilterBar({
  searchQuery,
  methodFilter,
  statusFilter,
  sortOrder,
  onUpdateParam,
  onReset,
  onExportJson,
}) {
  // Local state untuk input pencarian agar ketikan terasa instan sebelum masuk ke URL State
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onUpdateParam("q", debouncedSearch);
    }
  }, [debouncedSearch, searchQuery, onUpdateParam]);

  return (
    <section className="w-full bg-surface-low border border-ice/20 rounded-lg p-3 md:p-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ice pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari catatan atau ID log (contoh: pakan pagi, LOG-024)..."
            className="w-full bg-obsidian border border-ice/25 focus:border-ice text-ice-light text-xs pl-9 pr-4 py-2 rounded focus:outline-none placeholder:text-ice-muted transition-colors"
          />
        </div>

        {/* Filter, Sort & Action Group */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Filter Metode */}
          <div className="relative min-w-[135px] flex-1 sm:flex-none">
            <select
              value={methodFilter}
              onChange={(e) => onUpdateParam("method", e.target.value)}
              className="w-full appearance-none bg-obsidian border border-ice/25 hover:border-ice/50 text-ice-text font-mono text-xs px-3 py-2 pr-8 rounded cursor-pointer focus:outline-none transition-colors"
            >
              <option value="all">Metode: Semua</option>
              <option value="otomatis">Otomatis</option>
              <option value="manual">Manual</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-ice pointer-events-none" />
          </div>

          {/* Filter Status */}
          <div className="relative min-w-[135px] flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => onUpdateParam("status", e.target.value)}
              className="w-full appearance-none bg-obsidian border border-ice/25 hover:border-ice/50 text-ice-text font-mono text-xs px-3 py-2 pr-8 rounded cursor-pointer focus:outline-none transition-colors"
            >
              <option value="all">Status: Semua</option>
              <option value="berhasil">Berhasil</option>
              <option value="terjadwal">Terjadwal</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-ice pointer-events-none" />
          </div>

          {/* Sorting */}
          <div className="relative min-w-[160px] flex-1 sm:flex-none">
            <select
              value={sortOrder}
              onChange={(e) => onUpdateParam("sort", e.target.value)}
              className="w-full appearance-none bg-obsidian border border-ice/25 hover:border-ice/50 text-ice-text font-mono text-xs px-3 py-2 pr-8 rounded cursor-pointer focus:outline-none transition-colors"
            >
              <option value="newest">Urutkan: Terbaru</option>
              <option value="oldest">Urutkan: Terlama</option>
              <option value="portion_desc">Takaran Terbesar</option>
              <option value="temp_desc">Suhu Tertinggi</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-ice pointer-events-none" />
          </div>

          {/* Tombol Reset & Export JSON */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onReset}
              title="Reset Filter"
              className="px-3 py-2 bg-obsidian border border-ice/25 hover:border-ice hover:text-ice-light text-ice-muted font-mono text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={onExportJson}
              title="Ekspor Data JSON"
              className="px-3 py-2 bg-obsidian border border-ice/30 hover:bg-ice/10 text-ice font-mono text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}