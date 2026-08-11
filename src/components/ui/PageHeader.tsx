import React from "react"
import Link from "next/link"
import { Button } from "./Button"
import { Plus } from "lucide-react"

interface PageHeaderAction {
  label: string
  href: string
  icon?: React.ElementType
}

interface PageHeaderProps {
  title: string
  description?: string
  count?: number
  action?: PageHeaderAction
  /** Extra content (e.g. tabs) rendered in the right side of the header */
  toolbar?: React.ReactNode
}

export function PageHeader({ title, description, count, action, toolbar }: PageHeaderProps) {
  const ActionIcon = action?.icon ?? Plus

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            {title}
          </h2>
          {count !== undefined && (
            <span
              className="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold"
              style={{
                background: "var(--color-primary-light)",
                color: "var(--color-primary-dark)",
              }}
            >
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {toolbar}
        {action && (
          <Link href={action.href}>
            <Button size="default">
              <ActionIcon className="h-4 w-4" strokeWidth={2.5} />
              {action.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
