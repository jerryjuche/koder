"use client";

import Image from "next/image";
import { cn, getUserColor } from "@/lib";

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 sm:h-24 sm:w-24 text-3xl sm:text-4xl",
};

const badgeConfig: Record<string, { size: number; ring: string }> = {
  sm: { size: 14, ring: "ring-2" },
  md: { size: 16, ring: "ring-2" },
  lg: { size: 20, ring: "ring-[3px]" },
  xl: { size: 24, ring: "ring-[3px]" },
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

  const badge = badgeConfig[size];

  return (
    <div className={cn("relative inline-flex shrink-0 rounded-full", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full overflow-hidden",
          sizeMap[size],
          src ? "" : getUserColor(colorIndex),
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            width={100}
            height={100}
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <span
          className={cn(
            "font-bold text-white select-none",
            src ? "hidden" : "",
            size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : size === "lg" ? "text-sm" : "",
          )}
        >
          {initials}
        </span>
      </div>
      {verified && (
        <span
          className={cn(
            "absolute rounded-full bg-[#D4AF37] ring-[#1E1E2A] flex items-center justify-center",
            badge.ring,
          )}
          style={{
            width: badge.size,
            height: badge.size,
            bottom: -1,
            right: -1,
          }}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-[60%] h-[60%]"
          >
            <path
              d="M4 8.5l3 3 5.5-5.5"
              stroke="white"
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
