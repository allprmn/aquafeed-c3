export default function DetailMetricCard({ code, title, icon: Icon, children, footerLeft, footerRight }) {
  return (
    <div className="bg-[#060A0D] border border-ice/15 hover:border-ice/35 rounded-lg p-5 flex flex-col justify-between gap-4 transition-colors">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-ice-muted font-mono text-[10px]">
          <span className="uppercase tracking-wider">{code}</span>
          {Icon && <Icon className="w-4 h-4 text-ice" />}
        </div>
        <span className="text-ice-muted font-mono text-[11px] uppercase">{title}</span>
        <div className="mt-1">{children}</div>
      </div>

      <div className="pt-3 border-t border-ice/10 flex items-center justify-between font-mono text-[10px] text-ice-muted">
        <span>{footerLeft}</span>
        <span className="text-ice">{footerRight}</span>
      </div>
    </div>
  );
}