"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  totalPages: number
  currentPage: number
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  // Calculate page window (show max 5 pages)
  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, startPage + 4)
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4)
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex flex-1 justify-between sm:hidden">
        <Link
          href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
          className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}`}
          style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--color-foreground)" }}
        >
          Previous
        </Link>
        <Link
          href={currentPage < totalPages ? createPageURL(currentPage + 1) : "#"}
          className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${currentPage >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
          style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--color-foreground)" }}
        >
          Next
        </Link>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            Showing page <span className="font-medium" style={{ color: "var(--color-foreground)" }}>{currentPage}</span> of <span className="font-medium" style={{ color: "var(--color-foreground)" }}>{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Link
              href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 border ${currentPage <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-[var(--color-muted)]"}`}
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)", background: "var(--color-card)" }}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            
            {pages.map(page => (
              <Link
                key={page}
                href={createPageURL(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${page === currentPage ? "z-10" : "hover:bg-[var(--color-muted)]"}`}
                style={
                  page === currentPage 
                    ? { borderColor: "var(--color-primary)", background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }
                    : { borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--color-foreground)" }
                }
              >
                {page}
              </Link>
            ))}

            <Link
              href={currentPage < totalPages ? createPageURL(currentPage + 1) : "#"}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 border ${currentPage >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-[var(--color-muted)]"}`}
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)", background: "var(--color-card)" }}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
