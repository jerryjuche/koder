import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import DesktopOnlyOverlay from '@/components/DesktopOnlyOverlay';

export const metadata: Metadata = {
  metadataBase: new URL('https://koder.sbs'),
  title: {
    default: 'Koder — Master Go & Python Programming',
    template: '%s — Koder',
  },
  description:
    'Automated code-grading platform for Go and Python programming curricula. Solve problems, earn XP, and master software engineering.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Koder',
    title: 'Koder — Master Go & Python Programming',
    description:
      'Automated code-grading platform for Go and Python programming curricula. Solve problems, earn XP, and master software engineering.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Koder — Master Go & Python Programming',
    description:
      'Automated code-grading platform for Go and Python programming curricula.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"} />
        <DesktopOnlyOverlay />
        {children}
        <Analytics />
        <Toaster
          theme="dark"
          position="top-right"
          gap={12}
          offset={80}
          visibleToasts={5}
          toastOptions={{
            style: {
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              padding: 0,
            },
          }}
        />
      </body>
    </html>
  );
}
