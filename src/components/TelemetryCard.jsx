export default function TelemetryCard({ title, value, unit, icon: Icon, highlight = false, children }) {
  return (
    <div className="bg-obsidian border border-ice/20 rounded-lg p-4 flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-ice-muted uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-ice" />}
      </div>

      <div className="flex items-baseline gap-1.5 my-0.5 font-mono">
        <span
          className={`text-3xl font-semibold tracking-tight ${
            highlight ? "text-ice drop-shadow-[0_0_8px_rgba(125,211,252,0.3)]" : "text-ice-text"
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-ice font-medium">{unit}</span>}
      </div>

      <div className="flex flex-col gap-1.5 font-mono">{children}</div>
    </div>
  );
}