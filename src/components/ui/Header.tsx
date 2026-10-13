import React from 'react';
import { ShoppingBag, Search, Volume2, VolumeX } from 'lucide-react';
import { DepartmentId } from '../../types/store';
import { soundManager } from '../../audio/soundManager';
import { CrownLogo } from './CrownLogo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  activeDepartment: DepartmentId;
  onSelectDepartment: (dept: DepartmentId) => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  activeDepartment,
  onSelectDepartment,
  isSoundMuted,
  onToggleSound
}) => {
  return (
    <header className="relative z-30 flex items-center justify-between gap-8 px-6 py-4 border-b border-neutral-900 bg-neutral-950/95 backdrop-blur-md text-white shadow-xl">
      {/* Zone 1: Brand Insignia Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            soundManager.playClick(900);
            onSelectDepartment('all');
          }}
          className="flex items-center gap-3 group text-left cursor-pointer"
          aria-label="Cactus Bear 3D Virtual Showroom Home"
        >
          {/* Official Crown of Thorns Inlined Vector SVG Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 rounded-full bg-yellow-400/25 blur-md pointer-events-none" />
              <CrownLogo
                size={38}
                fill="#000000"
                stroke="#facc15"
                strokeWidth={1.8}
                glow={true}
                glowColor="#facc15"
                className="relative z-10 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-black tracking-tight text-yellow-400 whitespace-nowrap leading-tight">
                CACTUS BEAR
              </span>
              <span className="text-neutral-400 font-semibold text-[10px] uppercase tracking-widest">
                VIRTUAL SHOWROOM
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-400">
        <button
          onClick={() => {
            soundManager.playClick(800);
            onSelectDepartment('all');
          }}
          className={`hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDepartment === 'all' ? 'text-yellow-400 font-bold' : ''
          }`}
        >
          Overview 360°
        </button>
        <button
          onClick={() => {
            soundManager.playClick(800);
            onSelectDepartment('clothing');
          }}
          className={`hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDepartment === 'clothing' ? 'text-yellow-400 font-bold' : ''
          }`}
        >
          Clothing
        </button>
        <button
          onClick={() => {
            soundManager.playClick(800);
            onSelectDepartment('shoes');
          }}
          className={`hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDepartment === 'shoes' ? 'text-yellow-400 font-bold' : ''
          }`}
        >
          Shoes & Shelves
        </button>
        <button
          onClick={() => {
            soundManager.playClick(800);
            onSelectDepartment('caps');
          }}
          className={`hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDepartment === 'caps' ? 'text-yellow-400 font-bold' : ''
          }`}
        >
          Caps & Pegboard
        </button>
      </nav>

      {/* Zone 3: Primary action & controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Audio Ambiance Toggle */}
        <button
          onClick={() => onToggleSound()}
          aria-label={isSoundMuted ? 'Unmute showroom audio' : 'Mute showroom audio'}
          title={isSoundMuted ? 'Audio muted' : 'Audio enabled'}
          className="p-2.5 rounded-lg text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900 transition-colors"
        >
          {isSoundMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
        </button>

        {/* Search Modal Trigger */}
        <button
          onClick={() => {
            soundManager.playClick(800);
            onOpenSearch();
          }}
          aria-label="Search catalog"
          className="p-2.5 rounded-lg text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Shopping Bag Drawer Trigger */}
        <button
          onClick={() => {
            soundManager.playClick(900);
            onOpenCart();
          }}
          aria-label={`Shopping Cart with ${cartCount} items`}
          className="relative flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap shrink-0 shadow-md"
        >
          <ShoppingBag className="w-4 h-4 text-neutral-950" />
          <span className="hidden sm:inline font-bold">Cart</span>
          {cartCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-black text-yellow-400 text-[11px] font-black flex items-center justify-center font-mono">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
