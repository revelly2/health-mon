import React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "./Button"

export interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  colSpan?: number
  /** When true renders as a standalone section, not inside a table cell */
  standalone?: boolean
}

function EmptyStateContent({ icon: Icon, title, description, action }: Omit<EmptyStateProps, "colSpan" | "standalone">) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
        style={{ background: "var(--color-muted)", border: "1px solid var(--color-border)" }}
      >
        <Icon className="h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
        {title}
      </p>
      {description && (
        <p className="text-xs mt-1 max-w-[220px]" style={{ color: "var(--color-muted-foreground)" }}>
          {description}
        </p>
      )}
      {action && (
        <Link href={action.href} className="mt-5">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}

/** Use inside a table with colSpan */
export function EmptyStateRow({ colSpan = 6, ...props }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <EmptyStateContent {...props} />
      </td>
    </tr>
  )
}

/** Use as a standalone section (not in a table) */
export function EmptyState(props: EmptyStateProps) {
  return <EmptyStateContent {...props} />
}
