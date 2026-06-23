import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        {children}
        <Toaster 
          theme="dark" 
          position="top-right" 
          toastOptions={{
            classNames: {
              success: 'bg-brand-success/10 border-brand-success/50 text-brand-success',
              error: 'bg-brand-error/10 border-brand-error/50 text-brand-error',
              toast: 'bg-brand-charcoal-card border-brand-charcoal-border text-brand-offwhite'
            }
          }}
        />
      </body>
    </html>
  );
}
