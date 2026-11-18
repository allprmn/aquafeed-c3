import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Fish, Wifi, Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Riwayat Pakan", path: "/riwayat" },
  { label: "Jadwal & Form", path: "/jadwal" },
];

export default function Navbar() {
  // Local State: membuka/menutup menu navigasi di layar HP
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `font-mono text-xs px-3.5 py-1.5 rounded transition-all ${
      isActive
        ? "bg-ice/15 text-ice border border-ice/35 shadow-[0_0_12px_rgba(125,211,252,0.15)]"
        : "text-ice-muted hover:text-ice-light border border-transparent"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-pitch/90 backdrop-blur-md border-b border-ice/20">
      <div className="h-[68px] max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand & Subdomain */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-ice/10 border border-ice/30 flex items-center justify-center text-ice shrink-0">
            <Fish className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-medium text-ice-text tracking-tight truncate">
                AquaFeed C3
              </span>
              <span className="font-mono text-[10px] text-ice bg-ice/10 border border-ice/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                ESP32-C3
              </span>
            </div>
            <span className="font-mono text-[10px] text-ice-muted truncate">
              feeder.aldipramana.my.id
            </span>
          </div>
        </div>

        {/* Navigasi Desktop (Tanpa Reload Halaman) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-obsidian border border-ice/15">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === "/"} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Status Perangkat & Tombol Menu Mobile */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-obsidian border border-ice/25 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ice" />
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-ice-light tracking-wide whitespace-nowrap">
              ESP32-C3 • Online (24j)
            </span>
            <Wifi className="w-3.5 h-3.5 text-ice hidden sm:block" />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-obsidian border border-ice/20 text-ice hover:bg-ice/10"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Dropdown Navigasi Mobile */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-obsidian border-b border-ice/20 px-4 py-3 flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setMobileMenuOpen(false)}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}