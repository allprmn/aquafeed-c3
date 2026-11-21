import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import { feederService } from "../services/feederService";

const FeederContext = createContext(null);

export function FeederProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [device, setDevice] = useState(null);
  const [serialLogs, setSerialLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastSeenRef = useRef(null);

  const appendHeartbeatLine = useCallback((dev) => {
    if (!dev?.last_seen || dev.last_seen === lastSeenRef.current) return;
    lastSeenRef.current = dev.last_seen;

    setSerialLogs((prev) => {
      const nextLine = {
        id: `hb-${Date.now()}`,
        tag: "[POLL]",
        message: `Heartbeat OK • RSSI: ${dev.rssi || "-64 dBm"} • Servo: ${dev.servo_state || "Standby"}`,
        created_at: dev.last_seen,
        isHeartbeat: true,
      };
      return [...prev.slice(-79), nextLine];
    });
  }, []);

  const refreshAll = useCallback(async ({ simulateError = false } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const [logsData, schedulesData, deviceData, serialData] = await Promise.all([
        feederService.getFeedingLogs({ simulateError }),
        feederService.getSchedules(),
        feederService.getDeviceStatus(),
        feederService.getSerialLogs(40),
      ]);
      setLogs(logsData);
      setSchedules(schedulesData);
      setDevice(deviceData);
      setSerialLogs(serialData);
      if (deviceData?.last_seen) lastSeenRef.current = deviceData.last_seen;
    } catch (err) {
      setError(err.message || "Gagal memuat data dari Supabase.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    const channel = supabase
      .channel("aquafeed-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feeder_logs" },
        () => {
          feederService.getFeedingLogs().then(setLogs).catch(console.error);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feeder_schedules" },
        () => {
          feederService.getSchedules().then(setSchedules).catch(console.error);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feeder_device" },
        (payload) => {
          if (payload.new) {
            setDevice(payload.new);
            appendHeartbeatLine(payload.new);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feeder_serial_logs" },
        (payload) => {
          if (payload.new) {
            setSerialLogs((prev) => [...prev.slice(-79), payload.new]);
          }
        }
      )
      .subscribe();

    const devicePollInterval = setInterval(() => {
      feederService
        .getDeviceStatus()
        .then((dev) => {
          if (dev) {
            setDevice(dev);
            appendHeartbeatLine(dev);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(devicePollInterval);
    };
  }, [refreshAll, appendHeartbeatLine]);

  const clearSerialLogs = () => setSerialLogs([]);

  const triggerManualFeed = async (portion) => {
    const newLog = await feederService.triggerManualFeed(portion);
    setLogs((prev) => [newLog, ...prev]);
    setDevice((prev) =>
      prev ? { ...prev, servo_state: `Active / Moving (${portion.angle})` } : prev
    );
    return newLog;
  };

  const addSchedule = async (payload) => {
    const created = await feederService.createSchedule(payload);
    setSchedules((prev) =>
      [...prev, created].sort((a, b) => a.feedTime.localeCompare(b.feedTime))
    );
    return created;
  };

  const toggleSchedule = async (id) => {
    const target = schedules.find((s) => s.id === id);
    if (!target) return;
    const updated = await feederService.toggleSchedule(id, !target.isActive);
    setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const deleteSchedule = async (id) => {
    await feederService.deleteSchedule(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const todayStats = useMemo(() => {
    const todayLogs = logs.filter((item) => item.isToday);
    const totalGrams = todayLogs.reduce((sum, item) => sum + item.portionGram, 0);
    return {
      todayGrams: totalGrams,
      feedCount: todayLogs.length,
    };
  }, [logs]);

  return (
    <FeederContext.Provider
      value={{
        logs,
        schedules,
        device,
        serialLogs,
        isLoading,
        error,
        todayStats,
        refreshAll,
        clearSerialLogs,
        triggerManualFeed,
        addSchedule,
        toggleSchedule,
        deleteSchedule,
      }}
    >
      {children}
    </FeederContext.Provider>
  );
}

export function useFeeder() {
  const ctx = useContext(FeederContext);
  if (!ctx) {
    throw new Error("useFeeder harus digunakan di dalam <FeederProvider>");
  }
  return ctx;
}