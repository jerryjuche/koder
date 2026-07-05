import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-charcoal-base flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-brand-muted-gold mb-4">404</h1>
        <h2 className="text-xl font-semibold text-brand-offwhite mb-2">
          Page not found
        </h2>
        <p className="text-brand-offwhite-muted mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand-muted-gold px-6 py-3 text-sm font-semibold text-brand-charcoal-base transition-all hover:bg-brand-muted-gold-dark"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
