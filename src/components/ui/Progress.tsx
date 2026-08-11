import React from "react"

interface ProgressProps {
  value: number         // 0–100
  max?: number
  label?: string
  showValue?: boolean
  size?: "xs" | "sm" | "md"
  color?: string        // CSS color string
  className?: string
}

const sizeMap = { xs: "h-1", sm: "h-1.5", md: "h-2" }

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = "sm",
  color = "var(--color-primary)",
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--color-foreground)" }}>
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full ${sizeMap[size]}`}
        style={{ background: "var(--color-border)" }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

/** Dose progress: shows Dose X/Y as a series of pips */
export function DosePips({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{
            background: i < current ? "var(--color-success)" : "var(--color-border)",
          }}
        />
      ))}
      <span className="ml-1.5 text-xs tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>
        {current}/{total}
      </span>
    </div>
  )
}

/** Trimester progress badge */
export function TrimesterProgress({ trimester }: { trimester: number }) {
  const labels = ["", "1st", "2nd", "3rd"]
  const pct = ((trimester) / 3) * 100
  const colors = ["", "var(--color-primary)", "#9333ea", "var(--color-warning)"]

  return (
    <div className="flex items-center gap-2.5 min-w-[120px]">
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white flex-shrink-0"
        style={{ background: colors[trimester] }}
      >
        {trimester}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[11px] font-medium" style={{ color: "var(--color-foreground)" }}>
            {labels[trimester]} Trimester
          </span>
        </div>
        <Progress value={trimester} max={3} size="xs" color={colors[trimester]} />
      </div>
    </div>
  )
}
