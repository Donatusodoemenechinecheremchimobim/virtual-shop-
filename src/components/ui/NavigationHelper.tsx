import React, { useState } from 'react';
import { MousePointer, Eye, Move, Info, X } from 'lucide-react';

export const NavigationHelper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-20 p-2.5 bg-neutral-950/95 hover:bg-black text-yellow-400 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md transition-colors"
        title="View 3D showroom controls guide"
        aria-label="Controls Guide"
      >
        <Info className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-20 p-3.5 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl max-w-xs text-xs text-neutral-300">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2.5">
        <span className="font-bold text-yellow-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-yellow-400" />
          Interactive 3D Showroom
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-500 hover:text-white transition-colors"
          aria-label="Dismiss controls guide"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5 text-[11px] text-neutral-300">
        <div className="flex items-center gap-2">
          <MousePointer className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>Touch & drag clothes to inspect with cloth physics</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>Click any garment to inspect 360° & select sizes</span>
        </div>
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>Drag background to explore 360° showroom angles</span>
        </div>
      </div>
    </div>
  );
};
