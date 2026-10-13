import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, X, Check, ShoppingBag, RotateCw } from 'lucide-react';
import { Product } from '../../types/store';
import { PRODUCTS } from '../../data/products';
import {
  createCrownOfThornsApparelMesh,
  updateGarmentClothPhysics
} from '../3d/geometries';
import { soundManager } from '../../audio/soundManager';
import { formatNaira } from '../../utils/currency';

interface ProductInspectionViewProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, colorIndex: number) => void;
  onSelectProduct?: (product: Product) => void;
}

interface AnglePreset {
  id: string;
  label: string;
  shortLabel: string;
  rotY: number;
  imageUrl?: string;
}

export const ProductInspectionView: React.FC<ProductInspectionViewProps> = ({
  product,
  onClose,
  onAddToCart,
  onSelectProduct
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // User state
  const [selectedColorIndex, setSelectedColorIndex] = useState(product.defaultColorIndex ?? 0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [isAdded, setIsAdded] = useState(false);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Target angle for smooth camera/rotation transition
  const targetRotationY = useRef(0);

  // Interaction refs
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });

  // Angle presets
  const anglePresets: AnglePreset[] = [
    {
      id: 'front',
      label: 'Front View',
      shortLabel: 'Front',
      rotY: 0,
      imageUrl: product.angleImages?.front || product.cutoutUrl || product.imageUrl
    },
    {
      id: 'threeQuarter',
      label: '45° 3/4 View',
      shortLabel: '3/4',
      rotY: Math.PI / 4,
      imageUrl: product.angleImages?.threeQuarter || product.imageUrl
    },
    {
      id: 'sideLeft',
      label: 'Left Profile',
      shortLabel: 'Left',
      rotY: -Math.PI / 2,
      imageUrl: product.angleImages?.sideLeft || product.cutoutUrl || product.imageUrl
    },
    {
      id: 'sideRight',
      label: 'Right Profile',
      shortLabel: 'Right',
      rotY: Math.PI / 2,
      imageUrl: product.angleImages?.sideRight || product.imageUrl
    },
    {
      id: 'back',
      label: 'Back View',
      shortLabel: 'Back',
      rotY: Math.PI,
      imageUrl: product.angleImages?.back || product.imageUrl
    }
  ];

  // Sync state on product change
  useEffect(() => {
    setSelectedColorIndex(product.defaultColorIndex ?? 0);
    const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
    setSelectedSize(availableSizes.includes('M') ? 'M' : availableSizes[0]);
    setIsAdded(false);
    setActiveAngleIndex(0);
    targetRotationY.current = 0;
  }, [product.id]);

  // Keyboard escape listener to close view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundManager.playClick(600);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 3D Scene Initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Seamless yellow studio backdrop matching the showroom
    scene.background = new THREE.Color(0xfacc15);

    const isMobile = window.innerWidth < 768;
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      25
    );
    // Adjusted camera distance so the garment is perfectly framed in center
    camera.position.set(0, 0.15, isMobile ? 2.6 : 2.2);
    camera.lookAt(0, -0.05, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfef08a, 1.1);
    fillLight.position.set(-3.5, 2.5, 3);
    scene.add(fillLight);

    const backRim = new THREE.DirectionalLight(0xffffff, 1.2);
    backRim.position.set(0, 3, -4);
    scene.add(backRim);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    // Render loop
    let animId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      if (modelGroupRef.current) {
        if (!isDragging.current) {
          // Smooth inertia decay
          modelGroupRef.current.rotation.y += rotationVelocity.current.x;
          modelGroupRef.current.rotation.x += rotationVelocity.current.y;
          rotationVelocity.current.x *= 0.92;
          rotationVelocity.current.y *= 0.92;

          // If close to resting and not dragged, smoothly converge towards target angle if preset was chosen
          if (Math.abs(rotationVelocity.current.x) < 0.001) {
            modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
              modelGroupRef.current.rotation.y,
              targetRotationY.current,
              0.08
            );
          }
        }

        // Keep vertical tilt within comfortable bounds
        modelGroupRef.current.rotation.x = Math.max(
          -0.35,
          Math.min(0.35, modelGroupRef.current.rotation.x)
        );

        // Gentle dynamic cloth movement
        const spinSpeed = Math.abs(rotationVelocity.current.x);
        updateGarmentClothPhysics(modelGroupRef.current, {
          time,
          delta,
          windStrength: 0.8,
          centrifugal: Math.min(spinSpeed * 4.0, 0.35),
          impulseX: rotationVelocity.current.x * 2.0,
          impulseZ: rotationVelocity.current.y * 1.5
        });
      }

      renderer.render(scene, camera);
    };

    render();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.position.z = window.innerWidth < 768 ? 2.6 : 2.2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Update 3D garment mesh on product or color change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current = null;
    }

    const activeColorway = product.colorways[selectedColorIndex] || product.colorways[0];
    const newMesh = createCrownOfThornsApparelMesh(
      product,
      activeColorway,
      true, // isDetailedPDP = true to hide hanger completely
      false,
      product.garmentOffsets
    );

    newMesh.position.set(0, 0.05, 0);
    newMesh.rotation.set(0, targetRotationY.current, 0);

    modelGroupRef.current = newMesh;
    scene.add(newMesh);
  }, [product, selectedColorIndex]);

  // Pointer drag to rotate
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    previousPointer.current = { x: e.clientX, y: e.clientY };
    rotationVelocity.current = { x: 0, y: 0 };
    setHasInteracted(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !modelGroupRef.current) return;
    const deltaX = e.clientX - previousPointer.current.x;
    const deltaY = e.clientY - previousPointer.current.y;

    const rotSpeed = 0.01;
    modelGroupRef.current.rotation.y += deltaX * rotSpeed;
    modelGroupRef.current.rotation.x += deltaY * rotSpeed;
    targetRotationY.current = modelGroupRef.current.rotation.y;

    rotationVelocity.current = { x: deltaX * 0.0025, y: deltaY * 0.0025 };
    previousPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleSelectAngle = (idx: number) => {
    soundManager.playClick(750);
    setActiveAngleIndex(idx);
    setHasInteracted(true);
    const targetAngle = anglePresets[idx]?.rotY ?? 0;
    targetRotationY.current = targetAngle;
    if (modelGroupRef.current) {
      rotationVelocity.current = { x: 0, y: 0 };
    }
  };

  const handleAddToCartClick = () => {
    soundManager.playAddToCart();
    onAddToCart(product, selectedSize, selectedColorIndex);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2200);
  };

  const activeColorway = product.colorways[selectedColorIndex] || product.colorways[0];
  const sizeOptions = ['S', 'M', 'L', 'XL'];

  return (
    <div
      className="absolute inset-0 z-30 bg-[#facc15] overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      {/* =========================================================================
          LEFT SIDE: Top-Left Back Button & Left Thumbnail Column
      ========================================================================= */}

      {/* Circular Back Button (←) at top-left to return to showroom rack */}
      <button
        onClick={() => {
          soundManager.playClick(600);
          onClose();
        }}
        aria-label="Return to showroom rack"
        title="Return to showroom rack"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-950 text-white border border-yellow-400/40 hover:border-yellow-400 hover:text-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer group"
      >
        <ArrowLeft className="w-5 h-5 text-white group-hover:text-yellow-400 transition-colors" />
      </button>

      {/* Vertical Column of 3 to 5 small rounded square thumbnail buttons (w-12 h-12 rounded-xl) */}
      <div
        aria-label="Product angle switchers"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5 sm:gap-3"
      >
        {anglePresets.map((angle, idx) => {
          const isActive = activeAngleIndex === idx;
          return (
            <button
              key={angle.id}
              onClick={() => handleSelectAngle(idx)}
              title={angle.label}
              className={`w-12 h-12 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center relative p-1 ${
                isActive
                  ? 'bg-neutral-950 border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.65)] scale-110 z-10'
                  : 'bg-neutral-950/80 border border-neutral-800 hover:border-yellow-400/60 hover:bg-neutral-950 opacity-80 hover:opacity-100 hover:scale-105'
              }`}
            >
              {angle.imageUrl ? (
                <img
                  src={angle.imageUrl}
                  alt={angle.label}
                  className="w-full h-full object-contain filter drop-shadow"
                />
              ) : (
                <span className="font-mono text-[10px] font-bold text-white uppercase">
                  {angle.shortLabel}
                </span>
              )}
              {/* Active yellow dot indicator */}
              {isActive && (
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-yellow-400 shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          CENTER: Interactive 3D Canvas against Yellow Studio Backdrop
      ========================================================================= */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Minimal drag rotation guide tooltip (auto-hides after interaction) */}
      {!hasInteracted && (
        <div className="absolute bottom-32 md:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950/80 backdrop-blur-md text-white border border-yellow-400/30 text-xs font-semibold shadow-lg animate-pulse">
          <RotateCw className="w-3.5 h-3.5 text-yellow-400" />
          <span>Drag to rotate 360°</span>
        </div>
      )}

      {/* =========================================================================
          RIGHT SIDE: Compact Floating Vertical Card Layout
          (Desktop: right-6 top-1/2 -translate-y-1/2, Mobile: compact bottom card)
      ========================================================================= */}
      <aside
        aria-label="Product Information Card"
        className="absolute z-40 inset-x-4 bottom-4 md:bottom-auto md:inset-x-auto md:right-6 md:top-1/2 md:-translate-y-1/2 w-auto md:w-80 rounded-2xl bg-neutral-950 text-white p-5 border border-yellow-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-3.5 backdrop-blur-xl"
      >
        {/* Subtle Close ✕ Button in Top-Right Corner */}
        <button
          onClick={() => {
            soundManager.playClick(600);
            onClose();
          }}
          aria-label="Close product card"
          title="Close card"
          className="absolute top-3.5 right-3.5 p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header: Category & Title */}
        <div className="pr-6">
          <span className="text-[10px] font-mono font-bold tracking-widest text-yellow-400 uppercase">
            CLOTHING
          </span>
          <h2 className="font-display font-black text-lg md:text-xl text-white uppercase tracking-tight leading-tight mt-1">
            {product.name}
          </h2>
          <p className="text-neutral-400 text-xs mt-1 line-clamp-1">
            {product.subtitle}
          </p>
        </div>

        {/* Price in Yellow */}
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-2xl font-black text-yellow-400 tabular-nums">
            {formatNaira(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-mono text-xs text-neutral-500 line-through tabular-nums">
              {formatNaira(product.originalPrice)}
            </span>
          )}
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-auto">
            In Stock
          </span>
        </div>

        {/* Color Swatches */}
        {product.colorways && product.colorways.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-neutral-400 uppercase tracking-wider">
                Color
              </span>
              <span className="text-neutral-300 font-mono text-[10px] truncate max-w-[140px]">
                {activeColorway.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {product.colorways.map((c, idx) => {
                const isSelected = selectedColorIndex === idx;
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      soundManager.playClick(800);
                      setSelectedColorIndex(idx);
                    }}
                    title={c.name}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative ${
                      isSelected
                        ? 'ring-2 ring-yellow-400 scale-110 ring-offset-2 ring-offset-neutral-950'
                        : 'hover:scale-105 border border-neutral-700'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* 4-Column Size Selector Grid (S, M, L, XL pill buttons) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Select Size
          </span>
          <div className="grid grid-cols-4 gap-2">
            {sizeOptions.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => {
                    soundManager.playClick(850);
                    setSelectedSize(size);
                  }}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-yellow-400/50 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-Width Yellow Add to Cart Button */}
        <button
          onClick={handleAddToCartClick}
          disabled={isAdded}
          className={`w-full py-3.5 px-4 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            isAdded
              ? 'bg-emerald-400 text-neutral-950 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
              : 'bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-neutral-950 shadow-[0_4px_20px_rgba(250,204,21,0.35)]'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Added to Cart ✓</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </aside>
    </div>
  );
};
