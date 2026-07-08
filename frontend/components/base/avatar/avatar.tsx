"use client";

import { cn, getUserColor } from "@/lib";

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 sm:h-24 sm:w-24 text-3xl sm:text-4xl",
};

const badgeSizeMap: Record<string, { offset: string; svg: number }> = {
  sm: { offset: "-bottom-0.5 -right-0.5", svg: 14 },
  md: { offset: "-bottom-0.5 -right-0.5", svg: 16 },
  lg: { offset: "-bottom-1 -right-1", svg: 20 },
  xl: { offset: "-bottom-1 -right-1", svg: 24 },
};

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  colorIndex?: number;
  size?: "sm" | "md" | "lg" | "xl";
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
            size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : size === "lg" ? "text-sm" : "",
          )}
        >
          {initials}
        </span>
      </div>
      {verified && (
        <span className={cn("absolute", badgeSizeMap[size].offset)}>
          <svg
            width={badgeSizeMap[size].svg}
            height={badgeSizeMap[size].svg}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="11" fill="#D4AF37" stroke="#1E1E2A" strokeWidth="2" />
            <path
              d="M7 12.5l3 3 7-7"
              stroke="#1E1E2A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
