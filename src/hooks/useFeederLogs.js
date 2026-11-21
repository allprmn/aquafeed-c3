import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useFeeder } from "../context/FeederContext";

export function useFeederLogs(itemsPerPage = 6) {
  const { logs: rawLogs = [], isLoading, error, refreshAll } = useFeeder();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const methodFilter = searchParams.get("method") || "ALL";
  const statusFilter = searchParams.get("status") || "ALL";
  const sortOrder = searchParams.get("sort") || "newest";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (
      !value ||
      value === "ALL" ||
      (key === "sort" && value === "newest") ||
      (key === "page" && Number(value) === 1)
    ) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const resetAllFilters = () => setSearchParams({});

  const filteredLogs = useMemo(() => {
    return [...rawLogs]
      .filter((item) => {
        const matchesMethod = methodFilter === "ALL" || item.method === methodFilter;
        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          item.id.toLowerCase().includes(q) ||
          item.timeLabel.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q) ||
          String(item.portionGram).includes(q);

        return matchesMethod && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.dateIso).getTime() || 0;
        const timeB = new Date(b.dateIso).getTime() || 0;
        const portionA = Number(a.portionGram) || 0;
        const portionB = Number(b.portionGram) || 0;

        if (sortOrder === "oldest") return timeA - timeB;
        if (sortOrder === "portion_desc") return portionB - portionA || timeB - timeA;
        if (sortOrder === "portion_asc") return portionA - portionB || timeB - timeA;
        return timeB - timeA;
      });
  }, [rawLogs, searchQuery, methodFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, safePage, itemsPerPage]);

  return {
    logs: paginatedLogs,
    filteredLogs,
    totalItems: filteredLogs.length,
    totalCached: rawLogs.length,
    isLoading,
    error,
    refetch: refreshAll,
    searchQuery,
    methodFilter,
    statusFilter,
    sortOrder,
    currentPage: safePage,
    totalPages,
    updateParam,
    resetAllFilters,
  };
}