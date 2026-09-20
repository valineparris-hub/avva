interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color = '#0d9488',
  height = 'h-2.5',
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={`flex-1 bg-slate-200 rounded-full overflow-hidden ${height}`}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-slate-600 tabular-nums w-10 text-right">
          {pct}%
        </span>
      )}
    </div>
  );
}
