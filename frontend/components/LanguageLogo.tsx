import Image from "next/image";
import { cn } from "@/lib/utils";

export type Language = "go" | "python";

const languageIcon: Record<Language, string> = {
  go: "/icons/go.svg",
  python: "/icons/python.svg",
};

export function LanguageLogo({
  language,
  size = 20,
  className = "",
}: {
  language: Language;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("shrink-0", className)}>
      <Image
        src={languageIcon[language]}
        alt={language === "python" ? "Python icon" : "Go icon"}
        width={size}
        height={size}
        unoptimized
      />
    </div>
  );
}
