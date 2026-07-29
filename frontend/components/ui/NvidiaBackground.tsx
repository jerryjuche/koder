export default function NvidiaBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden md:block"
      aria-hidden="true"
    >
      {/* Orb 1 — large primary glow, top-left */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[55%] aspect-square
          motion-safe:animate-drift-slow will-change-transform"
        style={{
          background:
            'radial-gradient(ellipse at 35% 40%, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 65%)',
        }}
      />

      {/* Orb 2 — medium accent glow, right */}
      <div
        className="absolute top-[15%] -right-[10%] w-[40%] aspect-square
          motion-safe:animate-drift-medium will-change-transform"
        style={{
          background:
            'radial-gradient(ellipse at 55% 50%, color-mix(in srgb, var(--color-brand-cool-accent) 14%, transparent) 0%, transparent 60%)',
        }}
      />

      {/* Orb 3 — deep bottom glow */}
      <div
        className="absolute bottom-[5%] left-[30%] w-[45%] aspect-square
          motion-safe:animate-drift-slow-reverse will-change-transform"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--color-brand-muted-gold-dark) 12%, transparent) 0%, transparent 60%)',
        }}
      />

      {/* Dark overlay — ensures text readability on all pages */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/40 to-background/85" />
    </div>
  );
}
