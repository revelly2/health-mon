import * as React from "react"
import { cn } from "@/components/ui/Button"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-150",
          "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-foreground)]",
          "placeholder:text-[var(--color-muted-foreground)]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 focus-visible:border-[var(--color-primary)]",
          "hover:border-[var(--color-border-strong)]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-muted)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
