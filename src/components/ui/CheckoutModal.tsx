import React, { useState } from 'react';
import { CartItem } from '../../types/store';
import { X, CheckCircle, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../audio/soundManager';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const [isOrdered, setIsOrdered] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'cod'>('card');
  const [formData, setFormData] = useState({
    name: 'Alexandre Sterling',
    email: 'alex.sterling@example.com',
    address: '742 Evergreen Promenade, Suite 4B',
    city: 'New York',
    postalCode: '10001',
    country: 'United States',
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const generatedOrder = `COT-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrder);
    setIsOrdered(true);
    onClearCart();

    soundManager.playCheckoutSuccess();

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#18181b', '#f59e0b', '#3b82f6'],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-white">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick(600);
            onClose();
          }}
          aria-label="Close checkout"
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors border border-neutral-800"
        >
          <X className="w-4 h-4" />
        </button>

        {!isOrdered ? (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-black text-white tracking-tight">Express Checkout</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Complete your order from the Cactus Bear 3D showroom. Insured courier delivery direct from the atelier.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Shipping Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  Shipping Destination
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick(800);
                      setPaymentMethod('card');
                    }}
                    className={`p-3 text-xs font-semibold rounded-2xl border flex flex-col items-center gap-1.5 transition-colors ${
                      paymentMethod === 'card'
                        ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-md font-bold'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick(800);
                      setPaymentMethod('apple');
                    }}
                    className={`p-3 text-xs font-semibold rounded-2xl border flex flex-col items-center gap-1.5 transition-colors ${
                      paymentMethod === 'apple'
                        ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-md font-bold'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm"> Pay</span>
                    <span>Apple Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick(800);
                      setPaymentMethod('cod');
                    }}
                    className={`p-3 text-xs font-semibold rounded-2xl border flex flex-col items-center gap-1.5 transition-colors ${
                      paymentMethod === 'cod'
                        ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-md font-bold'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Pay on Delivery</span>
                  </button>
                </div>
              </div>

              {/* Order summary row */}
              <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-300">
                  <span>Items ({items.length})</span>
                  <span className="font-mono text-white font-bold tabular-nums">${subtotal}.00</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Insured Shipping</span>
                  <span className="font-mono text-white tabular-nums">
                    {shipping === 0 ? 'Free' : `$${shipping}.00`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-800">
                  <span>Total Amount</span>
                  <span className="font-mono text-yellow-400 tabular-nums">${total}.00</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Purchase · ${total}.00</span>
              </button>
            </form>
          </div>
        ) : (
          /* Order Confirmation View */
          <div className="py-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-yellow-400 tracking-wider">
                Order Confirmed
              </span>
              <h2 className="font-display text-2xl font-black text-white tracking-tight mt-1">
                Thank you, {formData.name}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Your purchase has been received and routed for dispatch. A confirmation receipt was sent to{' '}
                <span className="text-yellow-400 font-semibold">{formData.email}</span>.
              </p>
            </div>

            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl text-left max-w-md mx-auto space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">Order Reference</span>
                <span className="font-mono font-black text-yellow-400">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Destination</span>
                <span className="text-white font-medium text-right">{formData.address}, {formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Estimated Delivery</span>
                <span className="text-yellow-400 font-semibold">2–3 Business Days</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-400">Total Paid</span>
                <span className="font-mono font-black text-yellow-400 tabular-nums">${total}.00</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick(750);
                onClose();
              }}
              className="py-3.5 px-8 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-2xl text-xs font-black tracking-wider uppercase transition-colors shadow-md"
            >
              Return to Showroom
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
