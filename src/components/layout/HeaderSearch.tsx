"use client"

import { Search } from "lucide-react"

export default function HeaderSearch() {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
        style={{ color: "var(--color-muted-foreground)" }}
      />
      <input
        type="text"
        placeholder="Search records, residents…"
        className="header-search-input"
      />
    </div>
  )
}
