import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-pitch text-ice-text flex flex-col">
      <Navbar />

      <main className="flex-1 w-full pt-[68px]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="w-full bg-pitch border-t border-ice/15 py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left font-mono text-[11px] text-ice-muted">
          <p>© 2026 Aldi Pramana • IoT Smart Feeder System</p>
          <div className="flex items-center gap-4">
            <span className="text-ice/70">FW_VER: v2.4.1-rc3</span>
            <span>TELEMETRY_RATE: 1000ms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}