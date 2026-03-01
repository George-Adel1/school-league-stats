interface StatBarProps {
  label: string;
  leftValue: number;
  rightValue: number;
  leftColor?: string;
  rightColor?: string;
}

const StatBar = ({ label, leftValue, rightValue, leftColor, rightColor }: StatBarProps) => {
  const total = leftValue + rightValue || 1;
  const leftPct = (leftValue / total) * 100;
  const rightPct = (rightValue / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold w-8 text-right">{leftValue}</span>
      <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-muted gap-0.5">
        <div
          className="h-full rounded-l-full transition-all"
          style={{
            width: `${leftPct}%`,
            backgroundColor: leftColor || "hsl(var(--primary))",
          }}
        />
        <div
          className="h-full rounded-r-full transition-all"
          style={{
            width: `${rightPct}%`,
            backgroundColor: rightColor || "hsl(var(--primary))",
          }}
        />
      </div>
      <span className="text-sm font-semibold w-8">{rightValue}</span>
      <span className="text-xs text-muted-foreground w-24">{label}</span>
    </div>
  );
};

export default StatBar;
