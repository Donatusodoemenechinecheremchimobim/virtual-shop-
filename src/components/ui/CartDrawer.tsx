import React, { useState } from 'react';
import { CartItem } from '../../types/store';
import { X, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { formatNaira } from '../../utils/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 150;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const discountAmount = (subtotal * promoDiscount) / 100;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'CACTUS15' || promoCode.trim().toUpperCase() === 'JUSTDOIT15') {
      setPromoDiscount(15);
      setPromoMessage('15% Promo applied!');
      soundManager.playClick(1000);
    } else {
      setPromoMessage('Invalid code. Try "CACTUS15"');
      soundManager.playClick(400);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag Drawer"
    >
      <div className="relative w-full max-w-md h-full bg-neutral-950 border-l border-neutral-800 flex flex-col justify-between shadow-2xl animate-slideLeft text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-white tracking-tight">Shopping Bag</h2>
            <span className="text-xs text-yellow-400 font-mono font-bold">({items.length} items)</span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick(600);
              onClose();
            }}
            aria-label="Close cart drawer"
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors border border-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-3 bg-neutral-900/60 border-b border-neutral-800 text-xs">
          {subtotal >= freeShippingThreshold ? (
            <span className="text-yellow-400 font-bold">
              You qualify for Free Courier Delivery!
            </span>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Add ${freeShippingThreshold - subtotal} more for Free Shipping</span>
                <span className="font-mono text-yellow-400 font-bold">{Math.round((subtotal / freeShippingThreshold) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-yellow-400 mb-4">
                <Tag className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Your bag is empty</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Walk through the showroom and click any hanging piece to add it to your bag.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const color = item.product.colorways[item.selectedColorIndex] || item.product.colorways[0];
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-2xl"
                >
                  {/* Thumbnail Image */}
                  <img
                    src={item.product.cutoutUrl}
                    alt={item.product.name}
                    className="w-14 h-14 object-contain drop-shadow-md shrink-0 bg-neutral-950 rounded-xl p-1 border border-neutral-800"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">{item.product.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                      <span>Size {item.selectedSize}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{color.name}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-mono font-bold text-xs text-yellow-400 tabular-nums">
                        {formatNaira(item.product.price * item.quantity)}
                      </span>

                      {/* Steppers */}
                      <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => {
                            soundManager.playClick(600);
                            onUpdateQuantity(item.id, -1);
                          }}
                          aria-label="Decrease quantity"
                          className="p-1 text-neutral-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            soundManager.playClick(800);
                            onUpdateQuantity(item.id, 1);
                          }}
                          aria-label="Increase quantity"
                          className="p-1 text-neutral-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          soundManager.playClick(500);
                          onRemoveItem(item.id);
                        }}
                        aria-label="Remove item"
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Checkout Section */}
        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-950 space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo Code (CACTUS15)"
                className="flex-1 px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 uppercase font-semibold"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-yellow-400 rounded-xl transition-colors whitespace-nowrap shrink-0 border border-neutral-700"
              >
                Apply
              </button>
            </form>

            {promoMessage && (
              <p
                className={`text-xs ${
                  promoDiscount > 0 ? 'text-yellow-400 font-bold' : 'text-rose-400 font-semibold'
                }`}
              >
                {promoMessage}
              </p>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-white font-bold tabular-nums">{formatNaira(subtotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-yellow-400 font-semibold">
                  <span>Discount ({promoDiscount}%)</span>
                  <span className="font-mono tabular-nums">-{formatNaira(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-mono text-white tabular-nums">
                  {shipping === 0 ? 'Free' : formatNaira(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-800">
                <span>Total</span>
                <span className="font-mono text-yellow-400 tabular-nums">{formatNaira(total)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                soundManager.playClick(900);
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-neutral-950" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
