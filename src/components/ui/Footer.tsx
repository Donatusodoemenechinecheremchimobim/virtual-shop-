import React, { useState } from 'react';
import { ShieldCheck, Globe, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { CrownLogo } from './CrownLogo';

interface FooterProps {
  onExploreDepartment?: (dept: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Pinned Bottom-Left Brand Insignia & Footer Trigger */}
      <div className="fixed bottom-6 left-6 z-20">
        <div className="flex items-center gap-2 p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-neutral-300 hover:text-yellow-400 hover:bg-neutral-900 transition-all cursor-pointer group"
            title="Open Atelier Brand Dossier & Footer"
          >
            <div className="relative flex items-center justify-center p-1 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-yellow-400/50">
              <CrownLogo
                size={20}
                glow={false}
                className="text-yellow-400 transition-transform group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-black text-white group-hover:text-yellow-400 tracking-wider uppercase">
                Cactus Bear
              </span>
              <span className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase">
                Atelier Dossier
              </span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 ml-1 group-hover:text-yellow-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-500 ml-1 group-hover:text-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Atelier Footer Overlay Drawer */}
      {isExpanded && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4 sm:p-6 bg-neutral-950/95 backdrop-blur-2xl border-t border-neutral-800 text-white shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {/* Top Bar inside footer */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-inner">
                  <CrownLogo
                    size={48}
                    glow={false}
                    className="text-yellow-400"
                  />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-yellow-400 tracking-tight uppercase">
                    Cactus Bear Atelier
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
                    Official Crown of Thorns Insignia // Paris · Tokyo · Los Angeles
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3.5 py-1.5 text-xs font-mono text-neutral-400 hover:text-white bg-neutral-900 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* Footer 4-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-neutral-400">
              {/* Col 1: Manifesto */}
              <div>
                <span className="text-[11px] font-mono font-black text-white uppercase tracking-wider block mb-2">
                  Atelier Philosophy
                </span>
                <p className="leading-relaxed text-neutral-300">
                  Cactus Bear creates sculptural silhouettes, heavyweight loopback cotton garments, and bespoke footwear. Each piece embodies brutalist craftsmanship and experimental retail luxury.
                </p>
              </div>

              {/* Col 2: Brand Verification */}
              <div>
                <span className="text-[11px] font-mono font-black text-white uppercase tracking-wider block mb-2">
                  Insignia Authentication
                </span>
                <ul className="space-y-1.5 text-neutral-300">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Cryptographic NFC Tag Embedded</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Registered Trademark © 2026</span>
                  </li>
                  <li className="text-neutral-400 text-[11px] font-mono mt-1">
                    SKU Series: CB-COT-2026-SS
                  </li>
                </ul>
              </div>

              {/* Col 3: Coordinates */}
              <div>
                <span className="text-[11px] font-mono font-black text-white uppercase tracking-wider block mb-2">
                  Global Showrooms
                </span>
                <ul className="space-y-1 font-mono text-[11px] text-neutral-400">
                  <li className="text-neutral-200">PARIS: 14 Rue de Turenne</li>
                  <li className="text-neutral-200">TOKYO: 5-7-22 Minami-Aoyama</li>
                  <li className="text-neutral-200">LOS ANGELES: 846 N La Cienega</li>
                </ul>
              </div>

              {/* Col 4: Digital Specs */}
              <div>
                <span className="text-[11px] font-mono font-black text-white uppercase tracking-wider block mb-2">
                  Interactive Showroom
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                  Engine: Three.js WebGL 2.0<br />
                  Texture Color Space: sRGB<br />
                  Physics: Real-time Cloth Interpolation<br />
                  Insignia: Crown of Thorns Vector
                </p>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="pt-3 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 font-mono">
              <div className="flex items-center gap-2">
                <CrownLogo size={14} glow={false} className="text-yellow-400" />
                <span>© 2026 CACTUS BEAR STUDIOS. ALL RIGHTS RESERVED.</span>
              </div>
              <div className="flex items-center gap-4 mt-2 sm:mt-0 text-neutral-400">
                <span className="hover:text-yellow-400 transition-colors cursor-pointer">PRIVACY POLICY</span>
                <span>·</span>
                <span className="hover:text-yellow-400 transition-colors cursor-pointer">TERMS OF ATELIER</span>
                <span>·</span>
                <span className="hover:text-yellow-400 transition-colors cursor-pointer flex items-center gap-1">
                  ARCHIVES <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
