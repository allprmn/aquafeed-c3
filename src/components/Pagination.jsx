import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-ice/15 bg-obsidian/60">
      <span className="font-mono text-[11px] text-ice-muted">
        Menampilkan {startItem}–{endItem} dari {totalItems} data log
      </span>

      <nav aria-label="Pagination" className="flex items-center gap-1 font-mono text-xs">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 flex items-center justify-center rounded border border-ice/20 text-ice disabled:text-ice-muted/40 disabled:border-ice/10 disabled:cursor-not-allowed hover:bg-ice/10 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded border transition-colors cursor-pointer ${
                isActive
                  ? "bg-ice text-black font-bold border-ice shadow-[0_0_10px_rgba(125,211,252,0.3)]"
                  : "border-ice/20 text-ice-text hover:border-ice hover:text-ice hover:bg-ice/10"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded border border-ice/20 text-ice disabled:text-ice-muted/40 disabled:border-ice/10 disabled:cursor-not-allowed hover:bg-ice/10 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}