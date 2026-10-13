/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, DepartmentId, CartItem } from './types/store';
import { PRODUCTS } from './data/products';
import { Header } from './components/ui/Header';
import { DepartmentTabs } from './components/ui/DepartmentTabs';
import { VirtualShowroom } from './components/3d/VirtualShowroom';
import { FloatingProductTag } from './components/ui/FloatingProductTag';
import { ProductDetailModal } from './components/ui/ProductDetailModal';
import { CartDrawer } from './components/ui/CartDrawer';
import { CheckoutModal } from './components/ui/CheckoutModal';
import { SearchModal } from './components/ui/SearchModal';
import { NavigationHelper } from './components/ui/NavigationHelper';
import { HeroSection } from './components/ui/HeroSection';
import { Footer } from './components/ui/Footer';
import { soundManager } from './audio/soundManager';

export default function App() {
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(soundManager.getIsMuted());

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart_items', JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Cart handlers
  const handleAddToCart = (product: Product, size: string, colorIndex: number) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColorIndex === colorIndex
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${size}-${colorIndex}-${Date.now()}`,
          product,
          selectedSize: size,
          selectedColorIndex: colorIndex,
          quantity: 1,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsSoundMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#facc15] text-neutral-950 flex flex-col font-sans select-none">
      {/* Top 3-Zone Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        activeDepartment={activeDepartment}
        onSelectDepartment={setActiveDepartment}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Main 3D Virtual Showroom Canvas */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <VirtualShowroom
          activeDepartment={activeDepartment}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onHoverProduct={(p, pos) => {
            setHoveredProduct(p);
            setHoverPos(pos);
          }}
        />

        {/* Hero Section: Official Crown Brand Insignia & Atelier Dossier */}
        <HeroSection
          onExploreDepartment={(dept) => setActiveDepartment(dept as DepartmentId)}
        />

        {/* Floating Product Tag Tooltip on 3D hover */}
        <FloatingProductTag
          product={hoveredProduct}
          position={hoverPos}
        />

        {/* Bottom Department Quick Jump Navigation Tabs */}
        <DepartmentTabs
          activeDepartment={activeDepartment}
          onSelectDepartment={setActiveDepartment}
        />

        {/* Navigation Controls Helper Badge */}
        <NavigationHelper />

        {/* Luxury Streetwear Brand Footer with Crown Insignia */}
        <Footer
          onExploreDepartment={(dept) => setActiveDepartment(dept as DepartmentId)}
        />
      </main>

      {/* Product Detail Modal (PDP with 360° inspector) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onClearCart={handleClearCart}
      />

      {/* Search Catalog Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onJumpToDepartment={(dept) => setActiveDepartment(dept)}
      />
    </div>
  );
}
