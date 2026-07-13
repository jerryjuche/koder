import Link from 'next/link';
import Image from 'next/image';

const linkGroups = [
  {
    title: "Practice",
    links: [
      { label: "Problems", href: "/home" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Contribute", href: "/contribute" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "#" },
      { label: "GitHub", href: "https://github.com/jerryjuche/koder" },
      { label: "Report Issue", href: "https://github.com/jerryjuche/koder/issues" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-charcoal-border/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Koder"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-base font-bold tracking-tight text-brand-offwhite">
                Koder
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-offwhite-muted">
              Zero-cost automated code grading platform built for learners who
              want to write real code and get instant feedback.
            </p>
          </div>

          {/* Link groups */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-offwhite-muted">
                {group.title}
              </p>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-offwhite-muted/60 transition-colors hover:text-brand-offwhite"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-charcoal-border/30 pt-8 sm:flex-row">
          <p className="text-xs text-brand-offwhite-muted/50">
            &copy; {new Date().getFullYear()} Koder. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-brand-offwhite-muted/50">
            <span>Built with Go + Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
