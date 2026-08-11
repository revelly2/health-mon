import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, Info, CheckCircle2, XCircle, X } from "lucide-react"

const alertVariants = cva(
  "relative flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm",
  {
    variants: {
      variant: {
        default: [
          "border-[var(--color-border)]",
          "bg-[var(--color-muted)]",
          "text-[var(--color-foreground)]",
        ],
        info: [
          "border-[var(--color-info-light)]",
          "bg-[var(--color-info-light)]",
          "text-[var(--color-info-dark)]",
        ],
        success: [
          "border-[var(--color-success-light)]",
          "bg-[var(--color-success-light)]",
          "text-[var(--color-success-dark)]",
        ],
        warning: [
          "border-[var(--color-warning-light)]",
          "bg-[var(--color-warning-light)]",
          "text-[var(--color-warning-dark)]",
        ],
        destructive: [
          "border-[var(--color-danger-light)]",
          "bg-[var(--color-danger-light)]",
          "text-[var(--color-danger-dark)]",
        ],
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  onDismiss?: () => void
}

export function Alert({ className, variant = "default", title, children, onDismiss, ...props }: AlertProps) {
  const Icon = iconMap[variant ?? "default"]

  return (
    <div className={alertVariants({ variant, className })} role="alert" {...props}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={2} aria-hidden />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold leading-tight mb-0.5">{title}</p>
        )}
        <div className="text-[13px] leading-snug opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto flex-shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="font-semibold leading-tight mb-0.5">{children}</p>
)

export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[13px] leading-snug opacity-90">{children}</p>
)
