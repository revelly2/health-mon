"use client"

import React, { useState } from "react"

interface Tab {
  key: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (key: string) => void
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key)

  function handleChange(key: string) {
    setActive(key)
    onChange?.(key)
  }

  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-lg"
      style={{ background: "var(--color-muted)", border: "1px solid var(--color-border)" }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleChange(tab.key)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150"
            style={{
              background: isActive ? "var(--color-card)" : "transparent",
              color: isActive ? "var(--color-foreground)" : "var(--color-muted-foreground)",
              boxShadow: isActive ? "var(--shadow-xs)" : "none",
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                style={{
                  background: isActive ? "var(--color-primary-light)" : "transparent",
                  color: isActive ? "var(--color-primary-dark)" : "var(--color-muted-foreground)",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Server-compatible tab link row — renders links (no JS state) for use in server components.
 * Uses a URL search param `?tab=key` for active state.
 */
interface TabLinksProps {
  tabs: Tab[]
  activeKey: string
  paramName?: string
  basePath?: string
}

export function TabLinks({ tabs, activeKey, paramName = "tab", basePath = "" }: TabLinksProps) {
  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-lg"
      style={{ background: "var(--color-muted)", border: "1px solid var(--color-border)" }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey
        return (
          <a
            key={tab.key}
            href={`${basePath}?${paramName}=${tab.key}`}
            role="tab"
            aria-selected={isActive}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150"
            style={{
              background: isActive ? "var(--color-card)" : "transparent",
              color: isActive ? "var(--color-foreground)" : "var(--color-muted-foreground)",
              boxShadow: isActive ? "var(--shadow-xs)" : "none",
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                style={{
                  background: isActive ? "var(--color-primary-light)" : "transparent",
                  color: isActive ? "var(--color-primary-dark)" : "var(--color-muted-foreground)",
                }}
              >
                {tab.count}
              </span>
            )}
          </a>
        )
      })}
    </div>
  )
}
