import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border border-[var(--color-primary-light)]",
        secondary:
          "bg-[var(--color-secondary-light)] text-[var(--color-secondary-dark)] border border-[var(--color-secondary-light)]",
        destructive:
          "bg-[var(--color-danger-light)] text-[var(--color-danger-dark)] border border-[var(--color-danger-light)]",
        outline:
          "border border-[var(--color-border)] text-[var(--color-foreground)] bg-transparent",
        success:
          "bg-[var(--color-success-light)] text-[var(--color-success-dark)] border border-[var(--color-success-light)]",
        warning:
          "bg-[var(--color-warning-light)] text-[var(--color-warning-dark)] border border-[var(--color-warning-light)]",
        info:
          "bg-[var(--color-info-light)] text-[var(--color-info-dark)] border border-[var(--color-info-light)]",
        muted:
          "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
