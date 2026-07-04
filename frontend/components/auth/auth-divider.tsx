import { cn } from "@/lib/utils"

export function AuthDivider({
  text,
  className,
}: {
  text?: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-brand-charcoal-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-brand-charcoal-card px-3 text-brand-offwhite-muted/60 tracking-wider font-medium">
          {text ?? "or continue with"}
        </span>
      </div>
    </div>
  )
}
