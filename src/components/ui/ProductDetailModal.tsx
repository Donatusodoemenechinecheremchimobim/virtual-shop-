import React, { useState } from 'react';
import { Product } from '../../types/store';
import { ProductViewer3D } from '../3d/ProductViewer3D';
import { X, Check, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { CrownLogo } from './CrownLogo';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, colorIndex: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [selectedColorIndex, setSelectedColorIndex] = useState(product.defaultColorIndex);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  React.useEffect(() => {
    setSelectedColorIndex(product.defaultColorIndex);
    setSelectedSize(product.sizes[0] || 'M');
  }, [product.id, product.defaultColorIndex]);

  const activeColor = product.colorways[selectedColorIndex] || product.colorways[0];

  const handleAddToCart = () => {
    soundManager.playAddToCart();
    onAddToCart(product, selectedSize, selectedColorIndex);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden text-white">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick(600);
            onClose();
          }}
          aria-label="Close product inspector"
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors border border-neutral-800 shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: 3D Studio Stage */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-neutral-900/60 border-b md:border-b-0 md:border-r border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
              <span className="inline-flex items-center gap-1.5 uppercase tracking-wider font-bold text-yellow-400">
                <CrownLogo
                  size={16}
                  glow={false}
                  className="text-yellow-400 inline-block"
                />
                Cactus Bear Atelier
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-neutral-400">SKU: {product.sku}</span>
            </div>

            <h2 id="modal-product-title" className="font-display text-2xl font-black text-white tracking-tight">
              {product.name}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">{product.subtitle}</p>
          </div>

          {/* Interactive 3D Viewer */}
          <div className="my-4">
            <ProductViewer3D
              product={product}
              selectedColorIndex={selectedColorIndex}
            />
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-neutral-300 border-t border-neutral-800">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>100% Cotton</span>
            </div>
          </div>
        </div>

        {/* Right Side: Purchase Module */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-neutral-950">
          <div className="space-y-6">
            {/* Pricing Section */}
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-3xl font-black text-yellow-400 tabular-nums tracking-tight">
                  ${product.price}.00
                </span>
                {product.originalPrice && (
                  <span className="font-mono text-sm text-neutral-500 line-through tabular-nums">
                    ${product.originalPrice}.00
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-0.5 rounded-full">
                In Stock · Ready to Ship
              </span>
            </div>

            {/* Colorway Selection */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="text-neutral-400 font-semibold">Colorway</span>
                <span className="text-white font-bold">{activeColor.name}</span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {product.colorways.map((col, idx) => {
                  const isSelected = selectedColorIndex === idx;
                  return (
                    <button
                      key={col.name}
                      onClick={() => {
                        soundManager.playClick(900);
                        setSelectedColorIndex(idx);
                      }}
                      className={`relative w-8 h-8 rounded-full transition-transform border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-yellow-400 scale-110 shadow-md ring-2 ring-yellow-400/50'
                          : 'border-neutral-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                      aria-label={`Select ${col.name} color`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-black mix-blend-difference" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Picker */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="text-neutral-400 font-semibold">Select Size</span>
                <span className="text-neutral-400 underline cursor-pointer hover:text-yellow-400">
                  Size Guide
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        soundManager.playClick(750);
                        setSelectedSize(size);
                      }}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-md font-black'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Story & Description */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-800">
              <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Product Details
              </h3>
              <p className="text-xs leading-relaxed text-neutral-300">
                {product.description}
              </p>
              <ul className="space-y-1 text-xs text-neutral-300 list-disc list-inside">
                {product.features.map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>

            {/* Composition */}
            <div className="text-xs text-neutral-400 pt-1">
              <span className="text-neutral-300 font-semibold">Composition: </span>
              {product.materials}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 mt-6 border-t border-neutral-800 flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                addedToast
                  ? 'bg-emerald-500 text-white'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-neutral-950'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{addedToast ? 'Added to Bag!' : 'Add to Bag'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick(850);
                setIsWishlisted(!isWishlisted);
              }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`p-3.5 rounded-2xl border transition-colors ${
                isWishlisted
                  ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
