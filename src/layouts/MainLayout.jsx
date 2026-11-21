import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Wifi, WifiOff } from "lucide-react";
import { useFeeder } from "../context/FeederContext";

export default function MainLayout() {
  const { device } = useFeeder();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const isDeviceOnline =
  device?.last_seen && nowMs - new Date(device.last_seen).getTime() < 45000;

  const navLinkClass = ({ isActive }) =>
    `font-mono text-[11px] px-3.5 py-1.5 rounded transition-all ${
      isActive
        ? "bg-ice/15 text-ice border border-ice/35 shadow-[0_0_12px_rgba(125,211,252,0.12)]"
        : "text-ice-muted hover:text-ice-light border border-transparent"
    }`;

  return (
    <div className="min-h-screen bg-pitch text-ice-text flex flex-col">
      {/* Top Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-pitch/90 backdrop-blur-md border-b border-ice/20">
        <div className="h-[68px] w-full px-4 md:px-6 lg:px-10 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-ice/15 border border-ice/40 flex items-center justify-center font-mono text-xs font-bold text-ice shrink-0">
              AF
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base md:text-lg font-medium text-ice-text tracking-tight truncate">
                  AquaFeed C3
                </span>
                <span className="font-mono text-[10px] text-ice bg-ice/10 border border-ice/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  ESP32-C3
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-surface-low/60 border border-ice/15">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/riwayat" className={navLinkClass}>
              Riwayat Pakan
            </NavLink>
            <NavLink to="/jadwal" className={navLinkClass}>
              Jadwal & Form
            </NavLink>
          </nav>

          {/* Real-time Node Connectivity Pill */}
          <div className="flex items-center gap-2 bg-surface-low border border-ice/25 px-3 py-1.5 rounded-full shrink-0">
            {isDeviceOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-ice" />
                </span>
                <span className="font-mono text-[10px] text-ice-light tracking-wide whitespace-nowrap">
                  ESP32-C3 • Online ({device?.rssi || "-64 dBm"})
                </span>
                <Wifi className="w-3.5 h-3.5 text-ice ml-0.5" />
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2 w-2 bg-ice-muted/50" />
                <span className="font-mono text-[10px] text-ice-muted tracking-wide whitespace-nowrap">
                  ESP32-C3 • Offline
                </span>
                <WifiOff className="w-3.5 h-3.5 text-ice-muted ml-0.5" />
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav className="flex md:hidden items-center justify-around py-2 px-4 border-t border-ice/10 bg-obsidian">
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/riwayat" className={navLinkClass}>
            Riwayat Pakan
          </NavLink>
          <NavLink to="/jadwal" className={navLinkClass}>
            Jadwal & Form
          </NavLink>
        </nav>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full pt-[108px] md:pt-[68px] px-4 md:px-6 lg:px-10 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-pitch border-t border-ice/15 py-4 px-4 md:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left font-mono text-[10px] text-ice-muted">
          <p>© 2026 Aldi Pramana • IoT Smart Feeder System</p>
          
        </div>
      </footer>
    </div>
  );
}