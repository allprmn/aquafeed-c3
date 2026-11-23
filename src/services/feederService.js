import { supabase } from "../lib/supabase";

const DEVICE_ID = "esp32-c3-01";

function formatLogTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();

  const jakartaDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const jakartaNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

  const timeStr = jakartaDate
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(".", ":");

  const isSameDay =
    jakartaDate.getDate() === jakartaNow.getDate() &&
    jakartaDate.getMonth() === jakartaNow.getMonth() &&
    jakartaDate.getFullYear() === jakartaNow.getFullYear();

  const yesterday = new Date(jakartaNow);
  yesterday.setDate(jakartaNow.getDate() - 1);
  const isYesterday =
    jakartaDate.getDate() === yesterday.getDate() &&
    jakartaDate.getMonth() === yesterday.getMonth() &&
    jakartaDate.getFullYear() === yesterday.getFullYear();

  let dayLabel = jakartaDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
  if (isSameDay) dayLabel = "Hari ini";
  else if (isYesterday) dayLabel = "Kemarin";

  const yyyy = jakartaDate.getFullYear();
  const mm = String(jakartaDate.getMonth() + 1).padStart(2, "0");
  const dd = String(jakartaDate.getDate()).padStart(2, "0");

  return {
    timeLabel: `${dayLabel}, ${timeStr} WIB`,
    dateText: `UTC+7 • ${yyyy}-${mm}-${dd}`,
    isToday: isSameDay,
  };
}

function mapLogRow(row) {
  const { timeLabel, dateText, isToday } = formatLogTimestamp(row.created_at);
  return {
    uuid: row.id,
    id: row.log_code,
    timeLabel,
    dateIso: row.created_at,
    dateText,
    isToday,
    method: row.method,
    status: row.status,
    portionGram: row.portion_gram,
    servoAngle: row.servo_angle,
    servoDurationMs: row.servo_duration_ms,
    latencyMs: row.latency_ms ?? 18,
    rssi: row.rssi ?? "-64 dBm",
    notes: row.notes || "Eksekusi dispenser servo selesai tanpa kendala.",
  };
}

function mapScheduleRow(row) {
  return {
    id: row.id,
    title: row.title,
    feedTime: row.feed_time,
    portionGram: row.portion_gram,
    servoAngle: row.servo_angle,
    servoDuration: row.servo_duration,
    notes: row.notes || "",
    notifyWebhook: row.notify_webhook,
    isActive: row.is_active,
  };
}

export const feederService = {
  async getSerialLogs(limit = 40) {
    const { data, error } = await supabase
      .from("feeder_serial_logs")
      .select("*")
      .order("id", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data || []).reverse();
  },

  async getFeedingLogs({ simulateError = false } = {}) {
    if (simulateError) {
      throw new Error("Simulasi gagal terhubung ke REST API Supabase (Timeout 5000ms).");
    }

    const { data, error } = await supabase
      .from("feeder_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(mapLogRow);
  },

  async getFeedingLogById(logCode) {
    const { data, error } = await supabase
      .from("feeder_logs")
      .select("*")
      .ilike("log_code", logCode)
      .single();

    if (error || !data) {
      throw new Error(`Data log dengan ID "${logCode}" tidak ditemukan di database.`);
    }
    return mapLogRow(data);
  },

  async triggerManualFeed({ grams, angle, label }) {
    const durationMs = grams <= 5 ? 800 : grams <= 10 ? 1500 : 2200;

    // Ambil RSSI aktual perangkat dari tabel feeder_device
    const { data: currentDev } = await supabase
      .from("feeder_device")
      .select("rssi")
      .eq("id", DEVICE_ID)
      .single();

    const actualRssi = currentDev?.rssi || "-64 dBm";

    // 1. Kirim antrean perintah ke tabel feeder_device untuk dibaca ESP32-C3
    const { error: deviceError } = await supabase
      .from("feeder_device")
      .update({
        pending_portion_gram: grams,
        pending_angle: angle,
        servo_state: `Active / Moving (${angle})`,
      })
      .eq("id", DEVICE_ID);

    if (deviceError) throw new Error(deviceError.message);

    // 2. Catat riwayat pemberian pakan manual ke tabel feeder_logs
    const { data, error: logError } = await supabase
      .from("feeder_logs")
      .insert({
        method: "Manual",
        status: "Berhasil",
        portion_gram: grams,
        servo_angle: angle,
        servo_duration_ms: durationMs,
        latency_ms: 16,
        rssi: actualRssi,
        notes: `Pemberian pakan manual (${label}) dipicu melalui Dashboard Web.`,
      })
      .select()
      .single();

    if (logError) throw new Error(logError.message);
    return mapLogRow(data);
  },

  async setWaterPumpState(isActive) {
    const { error } = await supabase
      .from("feeder_device")
      .update({ pump_active: isActive })
      .eq("id", DEVICE_ID);

    if (error) throw new Error(error.message);
  },

  async getSchedules() {
    const { data, error } = await supabase
      .from("feeder_schedules")
      .select("*")
      .order("feed_time", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(mapScheduleRow);
  },

  async createSchedule(payload) {
    const { data, error } = await supabase
      .from("feeder_schedules")
      .insert({
        title: payload.title,
        feed_time: payload.feedTime,
        portion_gram: payload.portionGram,
        servo_angle: payload.servoAngle,
        servo_duration: payload.servoDuration,
        notes: payload.notes || null,
        notify_webhook: payload.notifyWebhook,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapScheduleRow(data);
  },

  async toggleSchedule(id, nextState) {
    const { data, error } = await supabase
      .from("feeder_schedules")
      .update({ is_active: nextState })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapScheduleRow(data);
  },

  async deleteSchedule(id) {
    const { error } = await supabase.from("feeder_schedules").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async getDeviceStatus() {
    const { data, error } = await supabase
      .from("feeder_device")
      .select("*")
      .eq("id", DEVICE_ID)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};