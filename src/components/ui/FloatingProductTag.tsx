import React from 'react';
import { Product } from '../../types/store';
import { ArrowUpRight } from 'lucide-react';

interface FloatingProductTagProps {
  product: Product | null;
  position: { x: number; y: number } | null;
}

export const FloatingProductTag: React.FC<FloatingProductTagProps> = ({ product, position }) => {
  if (!product || !position) return null;

  return (
    <div
      style={{
        left: `${position.x + 16}px`,
        top: `${position.y - 38}px`,
      }}
      className="fixed pointer-events-none z-30 flex items-center gap-3 px-3.5 py-2.5 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl transition-all duration-75 text-white"
    >
      <img
        src={product.cutoutUrl}
        alt={product.name}
        className="w-10 h-10 object-contain drop-shadow-md shrink-0"
      />

      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold">
          {product.subtitle.split('·')[0].trim()}
        </span>
        <span className="text-xs font-bold text-white max-w-[210px] truncate">
          {product.name}
        </span>
      </div>

      <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800">
        <span className="text-xs font-black text-yellow-400 font-mono tabular-nums">
          ${product.price}.00
        </span>
        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
      </div>
    </div>
  );
};
