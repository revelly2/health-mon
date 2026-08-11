"use client"

import { Search } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { useDebounce } from "use-debounce"

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("query") || ""
  
  const [text, setText] = useState(initialQuery)
  const [query] = useDebounce(text, 300)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    // Only update if it's different from the URL (to avoid infinite loops)
    const currentQuery = searchParams.get("query") || ""
    if (query !== currentQuery) {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set("query", query)
      } else {
        params.delete("query")
      }
      params.set("page", "1") // reset to page 1 on search
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }
  }, [query, pathname, router, searchParams])

  return (
    <div className="relative w-full">
      <Search 
        className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${isPending ? 'text-primary' : 'text-muted-foreground'}`} 
        style={{ color: isPending ? "var(--color-primary)" : "var(--color-muted-foreground)" }} 
      />
      <input
        type="text"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="header-search-input"
        style={{ paddingLeft: "36px", width: "100%" }}
      />
    </div>
  )
}
