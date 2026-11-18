import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { feederService } from "../services/feederService";

export function useFeederLogs(itemsPerPage = 6) {
  // Server State
  const [allLogs, setAllLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL State (?q=...&method=...&status=...&sort=...&page=...)
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const methodFilter = searchParams.get("method") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const sortOrder = searchParams.get("sort") || "newest";
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const updateParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      const isDefault =
        !value ||
        value === "all" ||
        (key === "sort" && value === "newest") ||
        (key === "page" && Number(value) === 1);

      if (isDefault) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }

      // Reset ke halaman 1 setiap kali filter/search/sort berubah
      if (key !== "page") {
        next.delete("page");
      }

      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const resetAllFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const fetchLogs = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feederService.getFeedingLogs(options);
      setAllLogs(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data riwayat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtering + Sorting
  const filteredAndSortedLogs = useMemo(() => {
    const keyword = searchQuery.toLowerCase().trim();

    return allLogs
      .filter((item) => {
        const matchSearch =
          !keyword ||
          item.id.toLowerCase().includes(keyword) ||
          item.timeLabel.toLowerCase().includes(keyword) ||
          item.notes.toLowerCase().includes(keyword);

        const matchMethod =
          methodFilter === "all" || item.method.toLowerCase() === methodFilter.toLowerCase();

        const matchStatus =
          statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();

        return matchSearch && matchMethod && matchStatus;
      })
      .sort((a, b) => {
        if (sortOrder === "oldest") return new Date(a.dateIso) - new Date(b.dateIso);
        if (sortOrder === "portion_desc") return b.portionGram - a.portionGram;
        if (sortOrder === "temp_desc") return b.waterTemp - a.waterTemp;
        return new Date(b.dateIso) - new Date(a.dateIso); // newest
      });
  }, [allLogs, searchQuery, methodFilter, statusFilter, sortOrder]);

  // Pagination
  const totalItems = filteredAndSortedLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredAndSortedLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedLogs, safePage, itemsPerPage]);

  return {
    logs: paginatedLogs,
    filteredLogs: filteredAndSortedLogs,
    totalItems,
    totalCached: allLogs.length,
    isLoading,
    error,
    refetch: fetchLogs,
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