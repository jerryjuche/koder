import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Koder — Code. Learn. Master Go.',
  description: 'A zero-cost, production-grade automated code-grading platform for Go programming.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          gap={12}
          offset={16}
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
