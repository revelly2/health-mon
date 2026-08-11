import React from "react"
import { cn } from "@/lib/utils"

interface ButtonUtilityProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  color?: "primary" | "secondary" | "danger" | "warning"
  tooltip?: string
  icon?: React.ElementType
}

export const ButtonUtility = React.forwardRef<HTMLButtonElement, ButtonUtilityProps>(
  ({ className, size = "md", color = "secondary", tooltip, icon: Icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        title={tooltip}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          // Sizes
          {
            "h-8 w-8": size === "sm",
            "h-10 w-10": size === "md",
            "h-12 w-12": size === "lg",
          },
          // Colors
          {
            "border-gray-300 bg-white text-gray-700 hover:bg-gray-50": color === "secondary",
            "border-transparent bg-[var(--color-primary)] text-white hover:opacity-90": color === "primary",
            "border-transparent bg-red-600 text-white hover:bg-red-700": color === "danger",
            "border-transparent bg-amber-500 text-white hover:bg-amber-600": color === "warning",
          },
          className
        )}
        {...props}
      >
        {Icon && <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />}
      </button>
    )
  }
)

ButtonUtility.displayName = "ButtonUtility"
