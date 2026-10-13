import React, { useState, useEffect, useRef } from 'react';
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
  // Retain the last active product during exit animation
  const [cachedProduct, setCachedProduct] = useState<Product | null>(product);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  // Swipe-down touch gesture tracking for the mobile bottom sheet
  const touchStartY = useRef<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);

  useEffect(() => {
    if (product) {
      setCachedProduct(product);
      // Select first available size or default 'M'
      const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
      setSelectedSize(availableSizes.includes('M') ? 'M' : availableSizes[0]);
      setIsAddedRecently(false);
      setTouchDeltaY(0);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0) {
        setTouchDeltaY(delta);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchDeltaY > 60) {
      soundManager.playClick(500);
      onClose();
    }
    touchStartY.current = null;
    setTouchDeltaY(0);
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP OVERLAY: Floating top-bar overlay (screens >= 768px)
          Sits sleekly just below the main navigation header
      ========================================================================= */}
      <aside
        aria-label="Desktop 3D Product Details Top-Bar"
        className={`hidden md:block fixed top-[69px] md:top-[73px] left-0 right-0 z-40 px-6 pointer-events-none transition-all duration-300 ease-out transform ${
          isVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto bg-neutral-950/98 backdrop-blur-xl border border-yellow-400 shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(250,204,21,0.2)] text-white">
          {/* Accent Bar Edge */}
          <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500" />

          {/* Content Container */}
          <div className="px-5 py-3.5 flex items-center justify-between gap-6">
            
            {/* LEFT: Clean square thumbnail with subtle gray/yellow background */}
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                onClick={() => onInspect?.(activeProduct)}
                title="Inspect 360° 3D details"
                className="relative w-16 h-16 shrink-0 bg-neutral-900 border border-yellow-400/40 p-1 flex items-center justify-center group overflow-hidden cursor-pointer transition-transform hover:border-yellow-400 active:scale-95"
              >
                <div className="absolute inset-0 bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-colors pointer-events-none" />
                <img
                  src={displayImage}
                  alt={activeProduct.name}
                  className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <Eye className="w-4 h-4 text-yellow-400" />
                </div>
              </button>

              {/* MIDDLE (Part 1 - Text & Price) */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400/90 font-mono">
                    ACTIVE GARMENT
                  </span>
                  <span className="text-neutral-600 text-xs" aria-hidden="true">·</span>
                  <span className="text-[10px] font-semibold text-neutral-400 truncate">
                    {activeProduct.subtitle.split('·')[0].trim()}
                  </span>
                </div>

                <h2 className="font-display font-black text-lg text-white uppercase tracking-tight truncate leading-tight mt-0.5">
                  {activeProduct.name}
                </h2>

                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-mono text-xl font-black text-yellow-400 tabular-nums">
                    ${activeProduct.price}.00
                  </span>
                  {activeProduct.originalPrice && (
                    <span className="font-mono text-xs text-neutral-500 line-through tabular-nums">
                      ${activeProduct.originalPrice}.00
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
                    IN STOCK
                  </span>
                </div>
              </div>
            </div>

            {/* MIDDLE (Part 2 - Small size selector using black pill buttons with yellow borders) */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mr-1">
                SIZE:
              </span>
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Garment size selection">
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
                      className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer border ${
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

            {/* RIGHT: Two primary action buttons: Solid yellow 'Add to Cart' button + subtle 'Close / X' button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleAddToCartClick}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.35)] hover:shadow-[0_0_25px_rgba(250,204,21,0.6)] ${
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

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick(500);
                  onClose();
                }}
                className="p-2.5 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-neutral-800"
                aria-label="Dismiss product overlay and return to 3D room"
                title="Return to browsing 3D room"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE VIEWPORT: Bottom Sheet Modal (screens < 768px)
          Slides up smoothly from the bottom when a 3D garment is tapped
      ========================================================================= */}
      {/* Backdrop Scrim */}
      <div
        onClick={() => {
          soundManager.playClick(500);
          onClose();
        }}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Bottom Sheet Drawer */}
      <div
        aria-label="Mobile Product Details Drawer"
        role="dialog"
        aria-modal="true"
        style={{
          transform: isVisible
            ? `translateY(${Math.max(0, touchDeltaY)}px)`
            : 'translateY(100%)',
        }}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950 border-t-2 border-yellow-400 shadow-[0_-16px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(250,204,21,0.25)] text-white px-5 pt-2.5 pb-6 transition-transform ease-out ${
          touchDeltaY === 0 ? 'duration-300' : 'duration-75'
        }`}
      >
        {/* Swipe-down handle bar */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            soundManager.playClick(500);
            onClose();
          }}
          className="w-full flex justify-center py-2 -mt-1 cursor-pointer select-none"
          title="Swipe down or tap to collapse back to rack view"
          aria-label="Collapse drawer"
        >
          <div className="w-12 h-1.5 bg-neutral-700 hover:bg-yellow-400 active:bg-yellow-400 rounded-full transition-colors" />
        </div>

        {/* Clean Row: Product thumbnail, Product name, Yellow price text, and Collapse '✕' icon */}
        <div className="flex items-center justify-between gap-3 mt-1">
          {/* Left: Square Thumbnail with subtle yellow accent */}
          <button
            type="button"
            onClick={() => onInspect?.(activeProduct)}
            className="relative w-16 h-16 shrink-0 bg-neutral-900 border border-yellow-400/50 rounded-lg p-1 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform"
            title="Inspect 360°"
          >
            <div className="absolute inset-0 bg-yellow-400/10 pointer-events-none" />
            <img
              src={displayImage}
              alt={activeProduct.name}
              className="w-full h-full object-contain relative z-10 drop-shadow-md"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 active:opacity-100 flex items-center justify-center z-20">
              <Eye className="w-4 h-4 text-yellow-400" />
            </div>
          </button>

          {/* Middle: Product Name & Yellow Price */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-mono font-black tracking-widest uppercase text-yellow-400/90">
              ACTIVE GARMENT
            </span>
            <h2 className="font-display font-black text-sm text-white uppercase tracking-tight truncate leading-tight mt-0.5">
              {activeProduct.name}
            </h2>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-base font-black text-yellow-400 tabular-nums">
                ${activeProduct.price}.00
              </span>
              {activeProduct.originalPrice && (
                <span className="font-mono text-xs text-neutral-500 line-through tabular-nums">
                  ${activeProduct.originalPrice}.00
                </span>
              )}
            </div>
          </div>

          {/* Right: '✕' Icon to collapse sheet back to rack view */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(500);
              onClose();
            }}
            className="p-2 -mr-1 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-900 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Collapse product details to rack view"
            title="Collapse to rack view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Size Picker (S, M, L, XL) with yellow outline pill buttons */}
        <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-neutral-900">
          <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest shrink-0">
            SIZE:
          </span>
          <div className="flex items-center gap-2 flex-1" role="radiogroup" aria-label="Garment size selector">
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
                  className={`flex-1 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] scale-102'
                      : 'bg-black text-neutral-300 border-yellow-400/60 hover:border-yellow-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-Width Yellow 'Add to Cart' Button */}
        <button
          type="button"
          onClick={handleAddToCartClick}
          className={`w-full mt-3.5 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-[0_0_20px_rgba(250,204,21,0.35)] ${
            isAddedRecently
              ? 'bg-emerald-400 text-black'
              : 'bg-yellow-400 hover:bg-yellow-300 text-black'
          }`}
        >
          {isAddedRecently ? (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>ADDED TO CART</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              <span>ADD TO CART</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};
