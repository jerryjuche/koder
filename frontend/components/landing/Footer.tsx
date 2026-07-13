import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-brand-charcoal-border bg-[#050505] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-muted-gold rounded-lg flex items-center justify-center font-bold text-brand-charcoal-base">
                K
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Koder</span>
            </Link>
            <p className="text-brand-offwhite-muted text-sm leading-relaxed mb-6">
              The automated code grading platform built for the modern developer. Master Go and Python with instant feedback.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/problems" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Problems</Link></li>
              <li><Link href="/leaderboard" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Leaderboard</Link></li>
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Go Tutorial</Link></li>
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Python Tutorial</Link></li>
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-brand-charcoal-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-brand-offwhite-muted">
          <p>© {new Date().getFullYear()} Koder. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-brand-offwhite transition-colors">Twitter</a>
            <a href="#" className="hover:text-brand-offwhite transition-colors">GitHub</a>
            <a href="#" className="hover:text-brand-offwhite transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
