`
# Dokumentasi Arsitektur Aplikasi — AquaFeed C3

**AquaFeed C3** adalah aplikasi web dashboard interaktif berbasis **React**, **React Router**, dan **Vite** yang terintegrasi secara *real-time* dengan database **Supabase (PostgreSQL)** serta mikrokontroler **ESP32-C3 SuperMini** dan aktuator **Micro Servo SG90** untuk sistem pemberian pakan ikan otomatis.

---

## 1. Routing dan Navigasi (\`React Router\`)

Aplikasi menerapkan *Single Page Application* (SPA) menggunakan \`BrowserRouter\` pada \`src/App.jsx\` sehingga perpindahan antarhalaman berlangsung instan tanpa *reload* halaman penuh.

### Struktur Rute Aplikasi
* **Nested Route (Layout Utama):** Rute induk \`<Route path="/" element={<MainLayout />}>\` membungkus seluruh halaman anak menggunakan komponen \`<Outlet />\`. Struktur ini menjaga elemen **Navbar** (indikator koneksi *online/offline* ESP32-C3) dan **Footer** tetap persisten di setiap halaman.
* **Halaman Statis & Fungsional (4 Halaman):**
  1. \`/\` (\`DashboardPage.jsx\`): Pusat kontrol pemberian pakan manual, kartu telemetri status perangkat & *countdown* jadwal berikutnya, ringkasan KPI harian, tabel aktivitas terbaru, serta *Serial Monitor* nirkabel secara *real-time*.
  2. \`/riwayat\` (\`HistoryPage.jsx\`): Halaman manajemen riwayat pemberian pakan dengan fitur pencarian, filter multi-kriteria, pengurutan data, paginasi, dan ekspor laporan \`.JSON\`.
  3. \`/riwayat/:id\` (\`HistoryDetailPage.jsx\`): **Dynamic Route** yang menangkap parameter ID log dari URL (contoh: \`/riwayat/LOG-001\`) menggunakan hook \`useParams()\` untuk menampilkan metrik eksekusi lengkap, verifikasi hash \`SHA-256\`, serta jejak log UART serial.
  4. \`/jadwal\` (\`SchedulePage.jsx\`): Halaman manajemen penjadwalan otomatis berbasis waktu NTP WIB (\`Asia/Jakarta\`) beserta formulir penambahan jadwal baru.
* **Navigasi Antarmenu:** Menggunakan \`<NavLink>\` pada menu navigasi (dengan penanda status aktif otomatis) serta \`<Link>\` untuk navigasi cepat ke halaman detail dan *breadcrumb*.

---

## 2. Manajemen State (5 Lapisan State)

Aplikasi memisahkan pengelolaan state ke dalam 5 kategori sesuai cakupan datanya:

1. **Local State (\`useState\`):**
   Mengatur kondisi interaksi internal komponen yang bersifat lokal, seperti status buka/tutup *popover* pemilih waktu (\`isPickerOpen\`), status *pause/resume* dan visibilitas *heartbeat* pada terminal serial (\`isPaused\`, \`showHeartbeat\`), indikator salin hash (\`copied\`), serta animasi status gerak servo sementara (\`localServoState\`).
2. **Global State (\`Context API\`):**
   Diimplementasikan melalui \`src/context/FeederContext.jsx\` (\`FeederProvider\` dan custom consumer hook \`useFeeder()\`). Context ini membagikan state global meliputi daftar riwayat (\`logs\`), jadwal aktif (\`schedules\`), status perangkat (\`device\`), aliran log serial (\`serialLogs\`), dan statistik harian (\`todayStats\`) ke seluruh halaman tanpa *prop drilling*.
3. **Server State:**
   Mengelola siklus hidup data asinkron dari REST API dan *Supabase Realtime* (\`postgres_changes\`), mencakup indikator pemuatan (\`isLoading\`), penanganan galat (\`error\`), serta fungsi pembaruan ulang (\`refreshAll\`) dan *fallback polling* setiap 5 detik untuk memantau status *heartbeat* ESP32-C3.
4. **URL State (\`useSearchParams\`):**
   Diterapkan di dalam custom hook \`src/hooks/useFeederLogs.js\` untuk menyimpan dan menyinkronkan parameter pencarian (\`?q=\`), filter metode (\`?method=\`), filter status (\`?status=\`), urutan data (\`?sort=\`), dan halaman aktif (\`?page=\`) langsung pada *query string* URL browser.
5. **Form State:**
   Menggunakan pola *Controlled Components* pada \`src/components/ScheduleForm.jsx\` untuk mengendalikan nilai setiap input (\`title\`, \`feedTime\`, \`servoAngle\`, \`notes\`, \`notifyWebhook\`), status interaksi (\`touched\`), dan objek pesan validasi (\`errors\`).

---

## 3. Data Fetching, Integrasi API & Sinkronisasi IoT

Seluruh komunikasi data dipisahkan dari lapisan tampilan UI ke dalam modul konfigurasi dan layanan khusus:

* **Konfigurasi Klien API (\`src/lib/supabase.js\`):** Menginisialisasi koneksi ke layanan Supabase menggunakan *environment variables* (\`VITE_SUPABASE_URL\` dan \`VITE_SUPABASE_ANON_KEY\`).
* **Service Layer (\`src/services/feederService.js\`):** Mengenkapsulasi seluruh pemanggilan API ke 4 tabel utama PostgreSQL beserta pemetaan format waktu ke zona \`Asia/Jakarta\` (WIB):
  * \`feeder_device\`: Menyimpan telemetri node ESP32-C3 (\`last_seen\`, \`rssi\`, \`servo_state\`) dan antrean perintah manual (\`pending_portion_gram\`, \`pending_angle\`).
  * \`feeder_schedules\`: Menyimpan daftar jadwal pemberian pakan otomatis yang disinkronkan oleh mikrokontroler setiap 30 detik.
  * \`feeder_logs\`: Menyimpan riwayat eksekusi pakan baik dari pemicu manual web maupun eksekusi otomatis jadwal NTP pada ESP32-C3.
  * \`feeder_serial_logs\`: Mengalirkan log output Serial Monitor dari ESP32-C3 ke dashboard web secara *real-time*.
* **Penanganan Kondisi Data (\`src/components/StateFeedback.jsx\`):**
  * **Loading State:** Menampilkan komponen \`<LoadingSkeleton />\` selama proses pengambilan data awal berlangsung.
  * **Error State:** Menampilkan komponen \`<ErrorState />\` beserta pesan kesalahan dan tombol **Coba Lagi** apabila koneksi API gagal (dilengkapi tombol simulasi galat untuk pengujian).
  * **Empty State:** Menampilkan komponen \`<EmptyState />\` ketika database kosong atau hasil pencarian/filter tidak menemukan kecocokan.

---

## 4. Fitur Pengelolaan Data & Validasi Formulir

### Pencarian, Filter, Sorting, dan Pagination
* **Search:** Pencarian *real-time* berdasarkan ID log (\`LOG-xxx\`), label waktu, catatan eksekusi, maupun takaran pakan.
* **Filter:** Penyaringan data berdasarkan **Metode Pemicu** (\`Otomatis\` / \`Manual\`) dan **Status Eksekusi** (\`Berhasil\` / \`Terjadwal\`).
* **Sorting:** Pengurutan daftar riwayat berdasarkan **Terbaru**, **Terlama**, **Takaran Terbesar**, dan **Takaran Terkecil**.
* **Pagination:** Pembagian daftar riwayat menjadi 6 item per halaman menggunakan komponen \`Pagination.jsx\` dengan navigasi nomor halaman yang tersimpan di URL.

### Formulir Interaktif & Validasi (\`ScheduleForm.jsx\`)
* **Custom 24-Hour Time Picker (WIB):** Pemilih jam (\`00–23\`) dan menit (\`00–59\`) berzona waktu \`Asia/Jakarta\` lengkap dengan tombol preset cepat dan tombol uji \`+2 Menit\`.
* **Preset Sudut Bukaan Servo SG90:** Tiga pilihan sudut bukaan katup (\`45°\` / 5g, \`90°\` / 10g, dan \`135°\` / 15g) yang otomatis memetakan durasi PWM (\`0.8s\`, \`1.5s\`, \`2.2s\`).
* **Aturan Validasi Input:**
  * **Nama Jadwal:** Wajib diisi, minimal 3 karakter, dan maksimal 32 karakter.
  * **Waktu Eksekusi:** Wajib mengikuti format 24 jam yang valid (\`HH:MM\`).
  * **Sudut Servo:** Wajib memilih salah satu dari 3 preset sudut yang tersedia.
  * **Catatan Singkat:** Opsional, maksimal 120 karakter.
  * Pesan kesalahan ditampilkan langsung di bawah kolom terkait secara *real-time* saat input tidak valid.

---

## 5. Custom Hooks & Reusable Components

### Custom Hook (\`src/hooks/useFeederLogs.js\`)
Hook \`useFeederLogs(itemsPerPage)\` mengabstraksi seluruh logika pengolahan data riwayat dari \`FeederContext\` dan \`useSearchParams\`, meliputi pembacaan parameter URL, pemfilteran gabungan (pencarian + metode + status), pengurutan komparatif, serta pemotongan data (*slicing*) untuk paginasi.

### Reusable Components (\`src/components/\`)
Aplikasi dibangun menggunakan 11 komponen modular yang dapat digunakan kembali:
1. \`ManualFeedCard.jsx\` — Kartu pemicu pemberian pakan manual dengan 3 preset porsi.
2. \`DeviceStatusCard.jsx\` — Kartu telemetri status ESP32-C3, kekuatan sinyal Wi-Fi (\`RSSI\`), dan *countdown* jadwal berikutnya.
3. \`TelemetryCard.jsx\` — Kartu metrik KPI modular untuk total pakan harian dan mode operasi.
4. \`RecentActivityTable.jsx\` — Tabel ringkasan 4 aktivitas pemberian pakan terbaru di dashboard.
5. \`SerialMonitorCard.jsx\` — Konsol *Serial Monitor* *real-time* dengan fitur *Pause/Resume*, filter *Heartbeat*, dan *Clear*.
6. \`LogFilterBar.jsx\` — Bilah kontrol pencarian, dropdown filter, pengurutan, reset, dan ekspor JSON.
7. \`Pagination.jsx\` — Navigasi halaman dinamis untuk daftar riwayat.
8. \`StateFeedback.jsx\` — Kumpulan komponen indikator \`LoadingSkeleton\`, \`ErrorState\`, dan \`EmptyState\`.
9. \`DetailMetricCard.jsx\` — Kartu metrik spesifikasi perangkat keras pada halaman detail log.
10. \`ScheduleForm.jsx\` — Formulir terkontrol dengan validasi dan *time picker* 24 jam WIB.
11. \`ScheduleCard.jsx\` — Kartu item jadwal otomatis dengan sakelar aktif/nonaktif dan tombol hapus.

---

## 6. Struktur Folder Proyek

Arsitektur kode menerapkan prinsip *Separation of Concerns* dengan memisahkan antara tampilan antarmuka, halaman, logika state, custom hook, dan layanan API:

~~~text
aquafeed-c3/
├── public/                     # Aset statis publik
├── src/
│   ├── components/             # 11 Reusable UI Components
│   │   ├── DetailMetricCard.jsx
│   │   ├── DeviceStatusCard.jsx
│   │   ├── LogFilterBar.jsx
│   │   ├── ManualFeedCard.jsx
│   │   ├── Pagination.jsx
│   │   ├── RecentActivityTable.jsx
│   │   ├── ScheduleCard.jsx
│   │   ├── ScheduleForm.jsx
│   │   ├── SerialMonitorCard.jsx
│   │   ├── StateFeedback.jsx
│   │   └── TelemetryCard.jsx
│   ├── context/                # Global State Management (Context API)
│   │   └── FeederContext.jsx
│   ├── data/                   # Dokumentasi & data statis pendukung
│   │   └── aquafeedDocs.js
│   ├── hooks/                  # Custom React Hooks
│   │   └── useFeederLogs.js
│   ├── layouts/                # Layout utama & navigasi persisten (Outlet)
│   │   └── MainLayout.jsx
│   ├── lib/                    # Inisialisasi klien Supabase
│   │   └── supabase.js
│   ├── pages/                  # Komponen halaman utama per rute
│   │   ├── DashboardPage.jsx
│   │   ├── HistoryDetailPage.jsx
│   │   ├── HistoryPage.jsx
│   │   └── SchedulePage.jsx
│   ├── services/               # Lapisan pemanggilan REST API & data mapping
│   │   └── feederService.js
│   ├── App.jsx                 # Konfigurasi React Router (Nested & Dynamic Routes)
│   ├── index.css               # Konfigurasi tema & utilitas Tailwind CSS
│   └── main.jsx                # Entry point aplikasi React
├── .env                        # Variabel kredensial VITE_SUPABASE_URL & ANON_KEY
├── index.html                  # Template HTML utama
├── package.json                # Daftar dependensi & skrip build Vite
├── vercel.json                 # Konfigurasi SPA rewrite untuk deployment Vercel
└── vite.config.js              # Konfigurasi bundler Vite
~~~
`

`
# Panduan Fitur & Cara Penggunaan — AquaFeed C3

**AquaFeed C3** adalah sistem kontrol dan pemantauan pemberian pakan ikan otomatis berbasis Internet of Things (IoT). Aplikasi web ini berfungsi sebagai pusat kendali jarak jauh yang terhubung secara *real-time* melalui **Supabase** ke mikrokontroler **ESP32-C3 SuperMini** dan aktuator katup **Micro Servo SG90** (\`GPIO 4\`).

---

## 1. Fitur-Fitur Utama Website

### A. Indikator Koneksi Perangkat (Top Navbar)
* **Pemantauan Status Online/Offline Real-time:** Menampilkan status koneksi mikrokontroler ESP32-C3 secara langsung berdasarkan sinyal *heartbeat* yang dikirim setiap 3 detik.
* **Indikator Kekuatan Sinyal Wi-Fi (RSSI):** Menampilkan kualitas sinyal jaringan 2,4 GHz dalam satuan \`dBm\` saat perangkat terhubung, dan otomatis beralih ke status **Offline** apabila perangkat terputus lebih dari 45 detik.

### B. Halaman Dashboard (\`/\`)
1. **Kontrol Pemberian Pakan Manual (\`ManualFeedCard\`):**
   * Menyediakan 3 pilihan takaran instan berdasarkan sudut bukaan katup servo:
     * **Porsi Kecil (\`5g\`):** Sudut bukaan \`45°\` selama \`0,8 detik\`.
     * **Porsi Sedang (\`10g\`):** Sudut bukaan \`90°\` selama \`1,5 detik\`.
     * **Porsi Besar (\`15g\`):** Sudut bukaan \`135°\` selama \`2,2 detik\`.
   * Dilengkapi tombol **Beri Makan Sekarang** untuk mengirim perintah eksekusi langsung ke ESP32-C3 serta informasi waktu pemberian pakan terakhir.
2. **Status Perangkat & Countdown Jadwal (\`DeviceStatusCard\`):**
   * Menampilkan status aktuator servo secara *real-time* (\`Standby / Detached 0°\` saat diam agar motor tetap dingin, atau \`Active / Moving\` saat katup terbuka).
   * Menampilkan waktu *heartbeat* terakhir dalam zona waktu **WIB (\`Asia/Jakarta\`)**.
   * **Hitung Mundur Otomatis (Countdown):** Menghitung sisa waktu (\`JJ : MM : DD\`) menuju jadwal aktif terdekat berikutnya beserta nama jadwal dan takarannya.
3. **Kartu Ringkasan KPI Harian (\`TelemetryCard\`):**
   * **Total Pakan Hari Ini:** Menghitung akumulasi gram pakan yang telah keluar hari ini dan membandingkannya dengan total target gram dari jadwal yang aktif.
   * **Mode Operasi:** Otomatis mendeteksi apakah sistem berjalan dalam mode **Otomatis** (memiliki jadwal aktif tersinkron NTP) atau **Manual** (0 jadwal aktif).
4. **Tabel Aktivitas Pakan Terbaru (\`RecentActivityTable\`):**
   * Menampilkan 4 riwayat eksekusi terakhir lengkap dengan waktu WIB, metode pemicu (\`Manual\` / \`Otomatis\`), takaran, latensi respons, dan status eksekusi.
5. **Serial Monitor Real-time (\`SerialMonitorCard\`):**
   * Menampilkan aliran log konsol dari ESP32-C3 secara nirkabel melalui *Supabase Realtime* (\`[WIFI]\`, \`[NTP]\`, \`[SCHED]\`, \`[CRON]\`, \`[CMD]\`, \`[SERVO]\`, \`[LOG]\`, dan \`[POLL]\`).
   * Dilengkapi tombol **Heartbeat ON/OFF** untuk menyaring log *polling* rutin, tombol **Pause/Resume** untuk menahan guliran layar saat membaca log, serta tombol **Clear** untuk membersihkan tampilan konsol.

### C. Halaman Riwayat Pakan (\`/riwayat\`)
* **Pencarian Kata Kunci (Search):** Mencari riwayat berdasarkan ID transaksi (\`LOG-xxx\`), keterangan waktu, catatan eksekusi, atau jumlah gram.
* **Filter Multi-Kriteria:** Menyaring daftar riwayat berdasarkan **Metode** (\`Semua\`, \`Otomatis\`, \`Manual\`) dan **Status** (\`Semua\`, \`Berhasil\`, \`Terjadwal\`).
* **Pengurutan Data (Sorting):** Mengurutkan riwayat berdasarkan **Terbaru**, **Terlama**, **Takaran: Terbesar**, atau **Takaran: Terkecil**.
* **Paginasi & Sinkronisasi URL:** Membagi daftar riwayat menjadi 6 baris per halaman dengan seluruh parameter filter tersimpan otomatis di URL browser.
* **Ekspor Laporan (.JSON):** Mengunduh seluruh data riwayat yang sedang difilter ke dalam berkas \`.JSON\`.

### D. Halaman Detail Eksekusi (\`/riwayat/:id\`)
* Menampilkan rincian teknis setiap eksekusi pakan berdasarkan ID log pada URL, mencakup metode pemicu, massa pakan keluar, durasi PWM servo, kekuatan sinyal \`RSSI\`, verifikasi hash integritas \`SHA-256\`, serta simulasi jejak log UART presisi milidetik.

### E. Halaman Jadwal & Form Pakan (\`/jadwal\`)
* **Formulir Jadwal Otomatis (\`ScheduleForm\`):**
  * Input nama jadwal dengan validasi otomatis (3–32 karakter).
  * **Custom 24-Hour Time Picker (WIB):** Pemilih jam (\`00–23\`) dan menit (\`00–59\`) berzona waktu \`Asia/Jakarta\` lengkap dengan pilihan waktu cepat (\`07:00\`, \`12:00\`, \`17:00\`, \`21:00\`) dan tombol **\`+2 Menit (Uji)\`** untuk pengujian cepat.
  * **Pilihan 3 Sudut Bukaan Servo:** Memilih bukaan katup \`45°\` (5g), \`90°\` (10g), atau \`135°\` (15g).
* **Daftar Jadwal Otomatis (\`ScheduleCard\`):**
  * Menampilkan seluruh slot jadwal yang tersimpan di database, lengkap dengan sakelar **Aktif/Nonaktif** dan tombol **Hapus** yang otomatis disinkronkan ke ESP32-C3 setiap 30 detik.

---

## 2. Cara Penggunaan Aplikasi

### Langkah 1: Memastikan Koneksi Perangkat ESP32-C3
1. Hubungkan mikrokontroler **ESP32-C3 SuperMini** ke sumber daya (adaptor/power bank) dan pastikan berada dalam jangkauan Wi-Fi 2,4 GHz yang telah dikonfigurasi.
2. Periksa indikator di pojok kanan atas **Navbar**. Jika status berubah menjadi **`ESP32-C3 • Online (-xx dBm)`**, perangkat sudah terhubung ke Supabase dan siap menerima perintah.

### Langkah 2: Memberi Pakan Secara Manual
1. Buka halaman **Dashboard** (\`/\`).
2. Pada kartu **Kontrol Pemberian Pakan Manual**, pilih salah satu takaran porsi (**Kecil 5g**, **Sedang 10g**, atau **Besar 15g**).
3. Klik tombol **Beri Makan Sekarang**.
4. Dalam waktu maksimal **3 detik**, ESP32-C3 akan mengeksekusi perintah, membuka katup servo sesuai sudut yang dipilih, mencatat log ke database, dan menampilkan prosesnya pada panel **Serial Monitor Real-time** di bagian bawah Dashboard.

### Langkah 3: Mengatur Jadwal Pakan Otomatis
1. Buka menu **Jadwal & Form** (\`/jadwal\`).
2. Isi **Nama Jadwal** pada formulir di sebelah kiri (contoh: *Pakan Pagi Kolam Utama*).
3. Klik kolom **Waktu Eksekusi (WIB)** untuk membuka pemilih waktu 24 jam, lalu tentukan **Jam** dan **Menit** (atau gunakan tombol **`+2 Menit (Uji)`** untuk mencoba eksekusi otomatis dalam 2 menit ke depan).
4. Pilih **Sudut Bukaan Servo** (\`45°\`, \`90°\`, atau \`135°\`) dan tambahkan catatan singkat bila diperlukan.
5. Klik tombol **Simpan Jadwal ke ESP32**.
6. Jadwal akan muncul pada panel **Daftar Jadwal Otomatis** di sebelah kanan dan otomatis diunduh oleh ESP32-C3 pada siklus sinkronisasi berikutnya (maksimal 30 detik). Gunakan sakelar di tiap kartu jadwal apabila ingin menonaktifkan jadwal sementara tanpa menghapusnya.

### Langkah 4: Memantau Riwayat & Mengunduh Laporan
1. Buka menu **Riwayat Pakan** (\`/riwayat\`) untuk melihat seluruh catatan pemberian pakan yang telah dieksekusi oleh sistem.
2. Gunakan kolom pencarian, dropdown **Metode**, **Status**, atau **Urutkan** untuk menyaring riwayat tertentu.
3. Klik ikon detail / kode log (misalnya **\`#LOG-001\`**) untuk membuka halaman **Detail Eksekusi** dan memeriksa metrik perangkat keras maupun jejak log serialnya.
4. Klik tombol **JSON** pada bilah filter apabila ingin mengunduh rekaman riwayat ke perangkat komputer.
`