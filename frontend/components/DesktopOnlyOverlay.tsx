'use client';

import { useEffect, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

const MIN_WIDTH = 900;

export default function DesktopOnlyOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => setShow(window.innerWidth < MIN_WIDTH);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D0D14] p-8">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#2A2A3A] bg-[#1A1A24]">
        <Monitor size={40} className="text-[#D4AF37]" />
      </div>

      <h1 className="mb-3 text-3xl font-bold text-white">Desktop Required</h1>

      <p className="max-w-sm text-center leading-relaxed text-[#A0A0B0]">
        Koder is built for desktop screens. For the full experience with the code editor, test runner, and real-time
        feedback, please open on a laptop or desktop computer.
      </p>

      <div className="mt-8 flex items-center gap-3 text-sm text-[#606070]">
        <Smartphone size={16} className="opacity-50" />
        <div className="h-px w-12 bg-[#2A2A3A]" />
        <span>Minimum width: 900px</span>
        <div className="h-px w-12 bg-[#2A2A3A]" />
        <Monitor size={16} className="opacity-50" />
      </div>
    </div>
  );
}
