'use client';

import { useEffect, useState, useRef } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

const MIN_WIDTH = 900;

export default function DesktopOnlyOverlay() {
  const [show, setShow] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const check = () => setShow(window.innerWidth < MIN_WIDTH);
    const debounced = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('resize', debounced);
    return () => {
      window.removeEventListener('resize', debounced);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overscroll-none bg-[#0D0D14] p-8">
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
