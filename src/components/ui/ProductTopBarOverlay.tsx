import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Check, Eye } from 'lucide-react';
import { Product } from '../../types/store';
import { soundManager } from '../../audio/soundManager';

interface ProductTopBarOverlayProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, colorIndex: number) => void;
  onInspect?: (product: Product) => void;
}

export const ProductTopBarOverlay: React.FC<ProductTopBarOverlayProps> = ({
  product,
  onClose,
  onAddToCart,
  onInspect,
}) => {
  // Retain the last active product during exit transition
  const [cachedProduct, setCachedProduct] = useState<Product | null>(product);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  useEffect(() => {
    if (product) {
      setCachedProduct(product);
      // Select first available size or default 'M'
      const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
      setSelectedSize(availableSizes.includes('M') ? 'M' : availableSizes[0]);
      setIsAddedRecently(false);
    }
  }, [product]);

  const activeProduct = product || cachedProduct;
  const isVisible = Boolean(product);

  if (!activeProduct) return null;

  const sizes = activeProduct.sizes && activeProduct.sizes.length > 0 ? activeProduct.sizes : ['S', 'M', 'L', 'XL'];
  const displayImage = activeProduct.cutoutUrl || activeProduct.imageUrl || (activeProduct.angleImages ? activeProduct.angleImages.threeQuarter : '');

  const handleAddToCartClick = () => {
    soundManager.playAddToCart();
    onAddToCart(activeProduct, selectedSize, activeProduct.defaultColorIndex ?? 0);
    setIsAddedRecently(true);
    setTimeout(() => {
      setIsAddedRecently(false);
    }, 1800);
  };

  return (
    <aside
      aria-label="Active 3D Product Details Overlay"
      className={`fixed top-[69px] md:top-[73px] left-0 right-0 z-40 px-2 sm:px-4 md:px-6 pointer-events-none transition-all duration-300 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-6 opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-6xl mx-auto bg-neutral-950/98 backdrop-blur-xl border border-yellow-400 shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(250,204,21,0.2)] text-white">
        {/* Accent Bar Edge */}
        <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500" />

        {/* Content Container */}
        <div className="p-3 md:px-5 md:py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          
          {/* LEFT: Clean square thumbnail with subtle gray/yellow background */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => onInspect?.(activeProduct)}
              title="Inspect 360° 3D details"
              className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-neutral-900 border border-yellow-400/40 p-1 flex items-center justify-center group overflow-hidden cursor-pointer transition-transform hover:border-yellow-400 active:scale-95"
            >
              {/* Subtle yellow ambient backdrop */}
              <div className="absolute inset-0 bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-colors pointer-events-none" />
              
              <img
                src={displayImage}
                alt={activeProduct.name}
                className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
              />
              
              {/* Subtle inspect hover hint */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <Eye className="w-4 h-4 text-yellow-400" />
              </div>
            </button>

            {/* MIDDLE (Part 1 - Text & Price): Mobile & Desktop */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400/90 font-mono">
                  ACTIVE GARMENT
                </span>
                <span className="text-neutral-600 text-xs" aria-hidden="true">·</span>
                <span className="text-[10px] font-semibold text-neutral-400 truncate hidden sm:inline">
                  {activeProduct.subtitle.split('·')[0].trim()}
                </span>
              </div>

              <h2 className="font-display font-black text-sm sm:text-base md:text-lg text-white uppercase tracking-tight truncate leading-tight mt-0.5">
                {activeProduct.name}
              </h2>

              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-base sm:text-lg md:text-xl font-black text-yellow-400 tabular-nums">
                  ${activeProduct.price}.00
                </span>
                {activeProduct.originalPrice && (
                  <span className="font-mono text-xs text-neutral-500 line-through tabular-nums">
                    ${activeProduct.originalPrice}.00
                  </span>
                )}
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1 hidden sm:inline">
                  IN STOCK
                </span>
              </div>
            </div>
          </div>

          {/* MIDDLE (Part 2 - Small size selector using black pill buttons with yellow borders) */}
          <div className="flex items-center justify-between md:justify-center gap-3 pt-2 md:pt-0 border-t border-neutral-900 md:border-t-0 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mr-1">
                SIZE:
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5" role="radiogroup" aria-label="Garment size selection">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        soundManager.playClick(900);
                        setSelectedSize(size);
                      }}
                      className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-black transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] scale-105'
                          : 'bg-black text-neutral-300 border-yellow-400/60 hover:border-yellow-400 hover:text-white hover:bg-neutral-900'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile-only Close X inside top-bar for quick touch */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick(500);
                onClose();
              }}
              className="p-1.5 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900 rounded transition-colors cursor-pointer md:hidden"
              aria-label="Close product details overlay"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* RIGHT: Two primary action buttons: Solid yellow 'Add to Cart' button + subtle 'Close / X' button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Solid yellow 'Add to Cart' button with bold black text */}
            <button
              type="button"
              onClick={handleAddToCartClick}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 md:py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.35)] hover:shadow-[0_0_25px_rgba(250,204,21,0.6)] ${
                isAddedRecently
                  ? 'bg-emerald-400 text-black'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-black'
              }`}
            >
              {isAddedRecently ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ADDED TO CART</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  <span>ADD TO CART</span>
                </>
              )}
            </button>

            {/* Desktop Subtle Close / X button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick(500);
                onClose();
              }}
              className="hidden md:flex p-2.5 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-neutral-800"
              aria-label="Dismiss product overlay and return to 3D room"
              title="Return to browsing 3D room"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </aside>
  );
};
