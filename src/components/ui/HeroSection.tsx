import React, { useState } from 'react';
import { Sparkles, Compass, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { CrownLogo } from './CrownLogo';

interface HeroSectionProps {
  onExploreDepartment?: (dept: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreDepartment
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute top-6 left-6 z-20 pointer-events-none transition-all duration-300 max-w-sm sm:max-w-md">
      <div className="pointer-events-auto bg-neutral-950/90 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl text-white">
        {/* Header Strip with Crown Insignia */}
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <CrownLogo
                size={34}
                glow={false}
                className="text-yellow-400 transition-all duration-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm tracking-tight text-white uppercase">
                  Cactus Bear
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-yellow-400 text-neutral-950">
                  SS26
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest">
                Official Brand Insignia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label={isCollapsed ? 'Expand Hero Section' : 'Collapse Hero Section'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="mt-3.5 space-y-3">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-black text-yellow-400 tracking-tight leading-tight uppercase">
                Crown of Thorns Atelier
              </h1>
              <p className="text-xs text-neutral-300 font-sans mt-1 leading-relaxed">
                Sculptural luxury streetwear designed in Paris & Tokyo. Interact in real-time 3D with our signature garments, footwear, and archival accessories.
              </p>
            </div>

            {/* Key Atelier Spec Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300">
                <Compass className="w-2.5 h-2.5 text-yellow-400" />
                360° WEBGL RUNWAY
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300">
                <Eye className="w-2.5 h-2.5 text-yellow-400" />
                CLOTH PHYSICS ENGINE
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-yellow-400/10 border border-yellow-400/30 text-[10px] font-mono text-yellow-400 font-bold">
                LIMITED ATELIER RUN
              </span>
            </div>

            {/* Quick action bar */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-900 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                LIVE SHOWROOM ACTIVE
              </span>
              {onExploreDepartment && (
                <button
                  onClick={() => onExploreDepartment('clothing')}
                  className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2 font-bold cursor-pointer transition-colors"
                >
                  View Featured Garment →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
