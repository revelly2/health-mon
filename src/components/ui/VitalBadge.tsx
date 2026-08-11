import React from "react"
import { Activity, Heart } from "lucide-react"

/** Blood pressure classification */
function classifyBP(bp: string | null): { label: string; color: string } | null {
  if (!bp) return null
  // Expects "120/80" format
  const parts = bp.split("/")
  if (parts.length !== 2) return null
  const sys = parseInt(parts[0], 10)
  const dia = parseInt(parts[1], 10)
  if (isNaN(sys) || isNaN(dia)) return null

  if (sys < 90 || dia < 60) return { label: "Low", color: "var(--color-info)" }
  if (sys < 120 && dia < 80) return { label: "Normal", color: "var(--color-success)" }
  if (sys < 130 && dia < 80) return { label: "Elevated", color: "var(--color-warning)" }
  if (sys < 140 || dia < 90) return { label: "High", color: "var(--color-warning)" }
  return { label: "Crisis", color: "var(--color-danger)" }
}

/** Heart rate classification */
function classifyHR(hr: number | null): { label: string; color: string } | null {
  if (hr === null || hr === undefined) return null
  if (hr < 60) return { label: "Low", color: "var(--color-info)" }
  if (hr <= 100) return { label: "Normal", color: "var(--color-success)" }
  if (hr <= 120) return { label: "Elevated", color: "var(--color-warning)" }
  return { label: "High", color: "var(--color-danger)" }
}

/** Fetal heart rate (normal: 110–160 bpm) */
function classifyFHR(fhr: number | null): { label: string; color: string } | null {
  if (fhr === null || fhr === undefined) return null
  if (fhr < 110) return { label: "Low", color: "var(--color-danger)" }
  if (fhr <= 160) return { label: "Normal", color: "var(--color-success)" }
  return { label: "High", color: "var(--color-warning)" }
}

export function BPBadge({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: "var(--color-muted-foreground)" }}>—</span>
  const cls = classifyBP(value)

  return (
    <div className="flex items-center gap-1.5">
      <Activity className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cls?.color ?? "var(--color-muted-foreground)" }} strokeWidth={2} />
      <span className="text-sm font-medium tabular-nums" style={{ color: "var(--color-foreground)" }}>
        {value}
      </span>
      {cls && (
        <span
          className="text-[10px] font-semibold"
          style={{ color: cls.color }}
        >
          {cls.label}
        </span>
      )}
    </div>
  )
}

export function HRBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined)
    return <span style={{ color: "var(--color-muted-foreground)" }}>—</span>
  const cls = classifyHR(value)

  return (
    <div className="flex items-center gap-1.5">
      <Heart className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cls?.color ?? "var(--color-muted-foreground)" }} strokeWidth={2} />
      <span className="text-sm font-medium tabular-nums" style={{ color: "var(--color-foreground)" }}>
        {value} bpm
      </span>
      {cls && (
        <span className="text-[10px] font-semibold" style={{ color: cls.color }}>
          {cls.label}
        </span>
      )}
    </div>
  )
}

export function FHRBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined)
    return <span style={{ color: "var(--color-muted-foreground)" }}>—</span>
  const cls = classifyFHR(value)

  return (
    <div className="flex items-center gap-1.5">
      <Heart className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cls?.color ?? "var(--color-muted-foreground)" }} fill="currentColor" strokeWidth={0} />
      <span className="text-sm font-medium tabular-nums" style={{ color: "var(--color-foreground)" }}>
        {value} bpm
      </span>
      {cls && (
        <span className="text-[10px] font-semibold" style={{ color: cls.color }}>
          {cls.label}
        </span>
      )}
    </div>
  )
}
