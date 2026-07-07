"use client";

import { cn, getUserColor } from "@/lib";
import { CheckCircle2 } from "lucide-react";

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const badgeSizeMap = {
  sm: { container: "h-3.5 w-3.5 bottom-0 right-0", icon: 14 },
  md: { container: "h-4 w-4 bottom-0 right-0", icon: 16 },
  lg: { container: "h-5 w-5 bottom-0 right-0", icon: 20 },
};

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  colorIndex?: number;
  size?: "sm" | "md" | "lg";
  verified?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt = "",
  name,
  colorIndex = 0,
  size = "md",
  verified = false,
  className,
}: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full overflow-hidden",
          sizeMap[size],
          src ? "" : getUserColor(colorIndex),
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <span
          className={cn(
            "font-bold text-white",
            src ? "hidden" : "",
            size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs",
          )}
        >
          {initials}
        </span>
      </div>
      {verified && (
        <span className={cn("absolute", badgeSizeMap[size].container)}>
          <CheckCircle2
            size={badgeSizeMap[size].icon}
            className="text-[#22C55E] fill-white"
          />
        </span>
      )}
    </div>
  );
}
