import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-brand-muted-gold text-brand-charcoal-base hover:bg-brand-muted-gold-dark": variant === "default",
            "bg-red-500 text-white hover:bg-red-500/90": variant === "destructive",
            "border border-brand-charcoal-border bg-transparent hover:bg-brand-charcoal-hover text-brand-offwhite": variant === "outline",
            "bg-brand-charcoal-panel text-brand-offwhite hover:bg-brand-charcoal-hover": variant === "secondary",
            "hover:bg-brand-charcoal-hover hover:text-brand-offwhite": variant === "ghost",
            "text-brand-muted-gold underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
