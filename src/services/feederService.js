// Data historis simulasi (nanti diganti fetch REST API Supabase)
export const MOCK_FEEDING_LOGS = [
  {
    id: "LOG-024",
    timeLabel: "Hari ini, 12:00 WIB",
    dateIso: "2026-11-18T12:00:00+07:00",
    dateText: "UTC+7 • 2026-11-18",
    method: "Otomatis",
    status: "Berhasil",
    portionGram: 10,
    servoAngle: "90°",
    servoDurationMs: 1500,
    waterTemp: 27.4,
    feedRemainingPct: 78,
    feedRemainingKg: "1.56 kg",
    latencyMs: 18,
    rssi: "-58 dBm",
    notes: "Pakan siang otomatis sesuai jadwal harian. Katup servo tertutup rapat.",
  },
  {
    id: "LOG-023",
    timeLabel: "Hari ini, 07:00 WIB",
    dateIso: "2026-11-18T07:00:00+07:00",
    dateText: "UTC+7 • 2026-11-18",
    method: "Otomatis",
    status: "Berhasil",
    portionGram: 10,
    servoAngle: "90°",
    servoDurationMs: 1500,
    waterTemp: 27.2,
    feedRemainingPct: 80,
    feedRemainingKg: "1.60 kg",
    latencyMs: 19,
    rssi: "-57 dBm",
    notes: "Pakan pagi rutin berjalan lancar via sinkronisasi NTP ESP32-C3.",
  },
  {
    id: "LOG-022",
    timeLabel: "Kemarin, 17:30 WIB",
    dateIso: "2026-11-17T17:30:00+07:00",
    dateText: "UTC+7 • 2026-11-17",
    method: "Otomatis",
    status: "Berhasil",
    portionGram: 15,
    servoAngle: "135°",
    servoDurationMs: 2200,
    waterTemp: 27.8,
    feedRemainingPct: 82,
    feedRemainingKg: "1.64 kg",
    latencyMs: 21,
    rssi: "-60 dBm",
    notes: "Pakan sore porsi besar untuk ikan koi dewasa.",
  },
  {
    id: "LOG-021",
    timeLabel: "Kemarin, 14:15 WIB",
    dateIso: "2026-11-17T14:15:00+07:00",
    dateText: "UTC+7 • 2026-11-17",
    method: "Manual",
    status: "Berhasil",
    portionGram: 5,
    servoAngle: "45°",
    servoDurationMs: 800,
    waterTemp: 27.9,
    feedRemainingPct: 84,
    feedRemainingKg: "1.68 kg",
    latencyMs: 14,
    rssi: "-56 dBm",
    notes: "Pemberian pakan tambahan manual dari dashboard HP.",
  },
  {
    id: "LOG-020",
    timeLabel: "Kemarin, 07:00 WIB",
    dateIso: "2026-11-17T07:00:00+07:00",
    dateText: "UTC+7 • 2026-11-17",
    method: "Otomatis",
    status: "Berhasil",
    portionGram: 10,
    servoAngle: "90°",
    servoDurationMs: 1500,
    waterTemp: 27.3,
    feedRemainingPct: 85,
    feedRemainingKg: "1.70 kg",
    latencyMs: 17,
    rssi: "-58 dBm",
    notes: "Pakan pagi rutin berjalan tanpa hambatan mekanik.",
  },
  {
    id: "LOG-019",
    timeLabel: "16 Nov, 17:30 WIB",
    dateIso: "2026-11-16T17:30:00+07:00",
    dateText: "UTC+7 • 2026-11-16",
    method: "Otomatis",
    status: "Berhasil",
    portionGram: 15,
    servoAngle: "135°",
    servoDurationMs: 2200,
    waterTemp: 27.6,
    feedRemainingPct: 87,
    feedRemainingKg: "1.74 kg",
    latencyMs: 20,
    rssi: "-59 dBm",
    notes: "Eksekusi jadwal sore tepat waktu.",
  },
  {
    id: "LOG-018",
    timeLabel: "16 Nov, 12:10 WIB",
    dateIso: "2026-11-16T12:10:00+07:00",
    dateText: "UTC+7 • 2026-11-16",
    method: "Manual",
    status: "Berhasil",
    portionGram: 5,
    servoAngle: "45°",
    servoDurationMs: 800,
    waterTemp: 28.1,
    feedRemainingPct: 89,
    feedRemainingKg: "1.78 kg",
    latencyMs: 15,
    rssi: "-55 dBm",
    notes: "Uji coba respon aktuator servo setelah kalibrasi sudut.",
  },
  {
    id: "LOG-017",
    timeLabel: "16 Nov, 07:00 WIB",
    dateIso: "2026-11-16T07:00:00+07:00",
    dateText: "UTC+7 • 2026-11-16",
    method: "Otomatis",
    status: "Berhasil",
    portionGram: 10,
    servoAngle: "90°",
    servoDurationMs: 1500,
    waterTemp: 26.9,
    feedRemainingPct: 90,
    feedRemainingKg: "1.80 kg",
    latencyMs: 18,
    rssi: "-58 dBm",
    notes: "Pakan pagi rutin. Suhu air pagi hari terpantau sejuk stabil.",
  },
  {
    id: "LOG-016",
    timeLabel: "15 Nov, 17:30 WIB",
    dateIso: "2026-11-15T17:30:00+07:00",
    dateText: "UTC+7 • 2026-11-15",
    method: "Otomatis",
    status: "Terjadwal",
    portionGram: 10,
    servoAngle: "90°",
    servoDurationMs: 1500,
    waterTemp: 27.5,
    feedRemainingPct: 92,
    feedRemainingKg: "1.84 kg",
    latencyMs: 22,
    rssi: "-61 dBm",
    notes: "Sinkronisasi antrean jadwal sore dari server cloud.",
  },
  {
    id: "LOG-015",
    timeLabel: "15 Nov, 07:00 WIB",
    dateIso: "2026-11-15T07:00:00+07:00",
    dateText: "UTC+7 • 2026-11-15",
    method: "Otomatis",
    status: "Berhasil",
    portionGram: 10,
    servoAngle: "90°",
    servoDurationMs: 1500,
    waterTemp: 27.1,
    feedRemainingPct: 94,
    feedRemainingKg: "1.88 kg",
    latencyMs: 17,
    rssi: "-57 dBm",
    notes: "Pakan pagi rutin setelah pengisian ulang hopper.",
  },
  {
    id: "LOG-014",
    timeLabel: "14 Nov, 19:00 WIB",
    dateIso: "2026-11-14T19:00:00+07:00",
    dateText: "UTC+7 • 2026-11-14",
    method: "Manual",
    status: "Berhasil",
    portionGram: 10,
    servoAngle: "90°",
    servoDurationMs: 1500,
    waterTemp: 27.7,
    feedRemainingPct: 96,
    feedRemainingKg: "1.92 kg",
    latencyMs: 16,
    rssi: "-58 dBm",
    notes: "Pemberian pakan malam manual pasca penggantian air parsial.",
  },
  {
    id: "LOG-013",
    timeLabel: "14 Nov, 07:00 WIB",
    dateIso: "2026-11-14T07:00:00+07:00",
    dateText: "UTC+7 • 2026-11-14",
    method: "Otomatis",
    status: "Berhasil",
    portionGram: 10,
    servoAngle: "90°",
    servoDurationMs: 1500,
    waterTemp: 27.0,
    feedRemainingPct: 98,
    feedRemainingKg: "1.96 kg",
    latencyMs: 19,
    rssi: "-58 dBm",
    notes: "Pakan pagi rutin berjalan normal.",
  },
];

export const feederService = {
  async getFeedingLogs({ simulateError = false } = {}) {
    // Simulasi latency jaringan 500ms agar state Loading Skeleton terlihat
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (simulateError) {
      throw new Error("Koneksi ke REST API Supabase terputus (Timeout 5000ms).");
    }

    return [...MOCK_FEEDING_LOGS];
  },

  async getFeedingLogById(id) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const found = MOCK_FEEDING_LOGS.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!found) {
      throw new Error(`Data log dengan ID "${id}" tidak ditemukan.`);
    }
    return found;
  },
};



export function getAdjacentLogIds(currentId) {
  const index = MOCK_FEEDING_LOGS.findIndex(
    (item) => item.id.toLowerCase() === currentId.toLowerCase()
  );
  if (index === -1) return { prevId: null, nextId: null };

  return {
    // Karena urutan array dari terbaru (index 0) ke terlama:
    nextId: index > 0 ? MOCK_FEEDING_LOGS[index - 1].id : null,
    prevId: index < MOCK_FEEDING_LOGS.length - 1 ? MOCK_FEEDING_LOGS[index + 1].id : null,
  };
}