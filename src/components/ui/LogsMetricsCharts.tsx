"use client"

import { Activity, Edit3, Trash2, PlusCircle } from "lucide-react"

interface LogsMetricsProps {
  added: number
  edited: number
  deleted: number
}

export function LogsMetricsCharts({ added, edited, deleted }: LogsMetricsProps) {
  const data = [
    { name: "Added", value: added, color: "#22c55e", icon: PlusCircle },
    { name: "Edited", value: edited, color: "#8b5cf6", icon: Edit3 },
    { name: "Deleted", value: deleted, color: "#ef4444", icon: Trash2 },
  ].filter(d => d.value > 0)

  const total = added + edited + deleted

  // Simple SVG Donut logic
  let cumulativePercent = 0
  
  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x, y]
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Chart Box */}
      <div 
        className="flex-1 rounded-[24px] border p-6 flex flex-col relative"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)" }}
      >
        <div>
          <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
            <Activity className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
            Action Distribution
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Breakdown of all {total} recorded system activities
          </p>
        </div>
        
        <div className="flex-1 min-h-[220px] mt-4 relative flex flex-col items-center justify-center">
          {total === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <svg viewBox="-1 -1 2 2" className="w-full h-full max-h-[160px] transform -rotate-90">
              {data.map((slice, i) => {
                const percent = slice.value / total
                const [startX, startY] = getCoordinatesForPercent(cumulativePercent)
                cumulativePercent += percent
                
                // If it's a full circle (100%), just draw a circle
                if (percent === 1) {
                  return (
                    <circle 
                      key={slice.name}
                      cx="0" cy="0" r="0.8" 
                      fill="transparent" 
                      stroke={slice.color} 
                      strokeWidth="0.4"
                    />
                  )
                }

                const [endX, endY] = getCoordinatesForPercent(cumulativePercent)
                const largeArcFlag = percent > 0.5 ? 1 : 0
                const pathData = [
                  `M ${startX * 0.8} ${startY * 0.8}`,
                  `A 0.8 0.8 0 ${largeArcFlag} 1 ${endX * 0.8} ${endY * 0.8}`
                ].join(' ')

                return (
                  <path 
                    key={slice.name}
                    d={pathData} 
                    fill="transparent" 
                    stroke={slice.color} 
                    strokeWidth="0.4"
                    className="transition-all duration-500 ease-out"
                  />
                )
              })}
            </svg>
          )}
          {total > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>{total}</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>Logs</span>
            </div>
          )}
        </div>
      </div>

      {/* Mini Stats Boxes */}
      <div className="grid grid-cols-3 gap-3">
        {data.length > 0 ? data.map((item) => (
          <div 
            key={item.name}
            className="rounded-[20px] border p-4 flex flex-col justify-between"
            style={{ 
              background: "var(--color-card)", 
              borderColor: "var(--color-border)",
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)" 
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `${item.color}15` }}
              >
                <item.icon className="h-4 w-4" style={{ color: item.color }} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--color-foreground)" }}>{item.value}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>{item.name}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-3 text-center text-sm py-4 text-gray-500">No actions recorded yet.</div>
        )}
      </div>
    </div>
  )
}
