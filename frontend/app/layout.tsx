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
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
