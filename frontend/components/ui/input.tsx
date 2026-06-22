import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-offwhite-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-muted-gold disabled:cursor-not-allowed disabled:opacity-50",
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
