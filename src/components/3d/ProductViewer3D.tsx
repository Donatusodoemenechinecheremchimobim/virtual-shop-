import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Product } from '../../types/store';
import {
  createCrownOfThornsApparelMesh,
  updateGarmentClothPhysics,
  matteBlackIndustrialSteelRailMat,
  applyGarmentOffsets,
  GarmentTransformOffsets
} from './geometries';
import { RotateCw, Image as ImageIcon, Box, SlidersHorizontal, Check, Copy, RotateCcw } from 'lucide-react';

// ============================================================================
// 3D GARMENT (.GLB / MESH) MANUAL POSITION, ROTATION & SCALE OFFSETS
// Fine-tune these variables to adjust garment alignment on the hanger:
//
// - POSITION: Shift down on the Y-axis (negative Y) so the collar rests perfectly on the hanger
// - ROTATION: Adjust angles (0 = hangs completely straight)
// - SCALE: Adjust dimensions (1.0 = standard true-to-scale sizing)
// ============================================================================

export const GARMENT_MANUAL_OFFSETS: GarmentTransformOffsets & { glbModelPath: string } = {
  // Manual position offset [x, y, z] in meters
  // Negative Y shifts the model DOWNWARD onto the contoured wooden hanger bar.
  position: {
    x: 0.00,       // Lateral offset (left / right)
    y: -0.560,     // Vertical offset: shifted down on Y-axis so collar rests perfectly on hanger bar
    z: 0.00        // Depth offset (front / back)
  },

  // Manual rotation offset [x, y, z] in radians
  // (0, 0, 0) hangs straight down without tilt.
  rotation: {
    x: 0.00,       // Pitch tilt (forward / backward)
    y: 0.00,       // Yaw orientation (aligned straight with hanger)
    z: 0.00        // Roll tilt (keeps shoulders level)
  },

  // Manual scale offset [x, y, z] multipliers
  scale: {
    x: 1.00,       // Width multiplier
    y: 1.00,       // Height multiplier
    z: 1.00        // Depth multiplier
  },

  // Optional custom .glb file path
  // If set and available, GLTFLoader renders the 3D .glb model with these offsets.
  glbModelPath: '/models/garment.glb'
};

// Direct export constants for easy single-value inspection/tuning:
export const GARMENT_POS_X = GARMENT_MANUAL_OFFSETS.position.x;
export const GARMENT_POS_Y = GARMENT_MANUAL_OFFSETS.position.y; // Shift down on y-axis
export const GARMENT_POS_Z = GARMENT_MANUAL_OFFSETS.position.z;

export const GARMENT_ROT_X = GARMENT_MANUAL_OFFSETS.rotation.x;
export const GARMENT_ROT_Y = GARMENT_MANUAL_OFFSETS.rotation.y; // Hangs straight
export const GARMENT_ROT_Z = GARMENT_MANUAL_OFFSETS.rotation.z;

export const GARMENT_SCALE_X = GARMENT_MANUAL_OFFSETS.scale.x;
export const GARMENT_SCALE_Y = GARMENT_MANUAL_OFFSETS.scale.y;
export const GARMENT_SCALE_Z = GARMENT_MANUAL_OFFSETS.scale.z;

export const GARMENT_GLB_URL = GARMENT_MANUAL_OFFSETS.glbModelPath;

interface ProductViewer3DProps {
  product: Product;
  selectedColorIndex: number;
}

const ALL_ANGLES = [
  {
    id: '3quarter',
    label: '45° 3/4',
    rotY: Math.PI / 4,
    image: '/products/angle-45-three-quarter.png',
    title: '45° Three-Quarter View'
  },
  {
    id: 'sideLeft',
    label: 'Left Side (Armhole)',
    rotY: -Math.PI / 2,
    image: '/products/angle-side-left.png',
    title: 'Left Profile (Armhole Depth)'
  },
  {
    id: 'sideRight',
    label: 'Right Side',
    rotY: Math.PI / 2,
    image: '/products/angle-side-right.png',
    title: 'Right Profile View'
  },
  {
    id: 'front',
    label: 'Front',
    rotY: 0,
    image: '/products/angle-front.png',
    title: 'Front View'
  },
  {
    id: 'back',
    label: 'Back',
    rotY: Math.PI,
    image: '/products/angle-back.png',
    title: 'Back View'
  }
] as const;

export const ProductViewer3D: React.FC<ProductViewer3DProps> = ({
  product,
  selectedColorIndex
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const productAngles = [
    {
      id: '3quarter',
      label: '45° 3/4',
      rotY: Math.PI / 4,
      image: product.angleImages?.threeQuarter || '/products/angle-45-three-quarter.png',
      title: '45° Three-Quarter View'
    },
    {
      id: 'sideLeft',
      label: 'Left Profile',
      rotY: -Math.PI / 2,
      image: product.angleImages?.sideLeft || '/products/angle-side-left.png',
      title: 'Left Profile View'
    },
    {
      id: 'sideRight',
      label: 'Right Profile',
      rotY: Math.PI / 2,
      image: product.angleImages?.sideRight || '/products/angle-side-right.png',
      title: 'Right Profile View'
    },
    {
      id: 'front',
      label: 'Front',
      rotY: 0,
      image: product.angleImages?.front || '/products/angle-front.png',
      title: 'Front View'
    },
    {
      id: 'back',
      label: 'Back',
      rotY: Math.PI,
      image: product.angleImages?.back || '/products/angle-back.png',
      title: 'Back View'
    }
  ];

  const [viewMode, setViewMode] = useState<'3d' | 'photo'>('3d');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);

  // Live Fine-Tune Calibration State (initialized with per-product offsets or top exposed offsets)
  const [offsets, setOffsets] = useState<GarmentTransformOffsets>(() => ({
    position: {
      x: product.garmentOffsets?.position?.x ?? GARMENT_MANUAL_OFFSETS.position.x,
      y: product.garmentOffsets?.position?.y ?? GARMENT_MANUAL_OFFSETS.position.y,
      z: product.garmentOffsets?.position?.z ?? GARMENT_MANUAL_OFFSETS.position.z,
    },
    rotation: {
      x: product.garmentOffsets?.rotation?.x ?? GARMENT_MANUAL_OFFSETS.rotation.x,
      y: product.garmentOffsets?.rotation?.y ?? GARMENT_MANUAL_OFFSETS.rotation.y,
      z: product.garmentOffsets?.rotation?.z ?? GARMENT_MANUAL_OFFSETS.rotation.z,
    },
    scale: {
      x: product.garmentOffsets?.scale?.x ?? GARMENT_MANUAL_OFFSETS.scale.x,
      y: product.garmentOffsets?.scale?.y ?? GARMENT_MANUAL_OFFSETS.scale.y,
      z: product.garmentOffsets?.scale?.z ?? GARMENT_MANUAL_OFFSETS.scale.z,
    }
  }));

  // Re-sync offsets if switching between different garments
  useEffect(() => {
    setOffsets({
      position: {
        x: product.garmentOffsets?.position?.x ?? GARMENT_MANUAL_OFFSETS.position.x,
        y: product.garmentOffsets?.position?.y ?? GARMENT_MANUAL_OFFSETS.position.y,
        z: product.garmentOffsets?.position?.z ?? GARMENT_MANUAL_OFFSETS.position.z,
      },
      rotation: {
        x: product.garmentOffsets?.rotation?.x ?? GARMENT_MANUAL_OFFSETS.rotation.x,
        y: product.garmentOffsets?.rotation?.y ?? GARMENT_MANUAL_OFFSETS.rotation.y,
        z: product.garmentOffsets?.rotation?.z ?? GARMENT_MANUAL_OFFSETS.rotation.z,
      },
      scale: {
        x: product.garmentOffsets?.scale?.x ?? GARMENT_MANUAL_OFFSETS.scale.x,
        y: product.garmentOffsets?.scale?.y ?? GARMENT_MANUAL_OFFSETS.scale.y,
        z: product.garmentOffsets?.scale?.z ?? GARMENT_MANUAL_OFFSETS.scale.z,
      }
    });
  }, [product.id]);

  const [showCalibrationPanel, setShowCalibrationPanel] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);

  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });

  // Update mesh when product or colorway changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
    }

    const colorway = product.colorways[selectedColorIndex] || product.colorways[0];
    const newMesh = createCrownOfThornsApparelMesh(product, colorway, true, false, offsets);
    newMesh.position.set(0, -0.15, 0);
    // Strictly maintain 45-degree three-quarter perspective by default
    newMesh.rotation.set(0, productAngles[activeAngleIndex]?.rotY ?? 0, 0);

    // Sleek horizontal matte-black industrial steel floating garment rail segment
    // positioned so the silver hook rests securely over it with exact structural mechanics
    const railSegmentGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.8, 32);
    railSegmentGeo.rotateZ(Math.PI / 2);
    const railSegmentMesh = new THREE.Mesh(railSegmentGeo, matteBlackIndustrialSteelRailMat);
    // In local coordinates of newMesh, rail center is at y = 0.580
    railSegmentMesh.position.set(0, 0.580, 0);
    railSegmentMesh.castShadow = true;
    railSegmentMesh.receiveShadow = true;
    newMesh.add(railSegmentMesh);

    // Wall mounting arm for floating industrial aesthetic
    const railMountGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.45, 16);
    railMountGeo.rotateX(Math.PI / 2);
    const railMountMesh = new THREE.Mesh(railMountGeo, matteBlackIndustrialSteelRailMat);
    railMountMesh.position.set(0, 0.580, -0.22);
    railMountMesh.castShadow = true;
    newMesh.add(railMountMesh);

    modelGroupRef.current = newMesh;
    scene.add(newMesh);
  }, [product, selectedColorIndex]);

  // Dynamically update garment transform when fine-tuning offsets
  useEffect(() => {
    if (modelGroupRef.current) {
      applyGarmentOffsets(modelGroupRef.current, offsets);
    }
  }, [offsets]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean studio backdrop matching dark/yellow atelier
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // Transparent against dark atelier backdrop

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      20
    );
    camera.position.set(0, 0.35, 2.7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Studio Daylight Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff7ed, 0.8);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // Matte Black Architectural Studio Plinth with Streetwear Yellow Accent
    const plinthGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.08, 36);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.42,
      metalness: 0.75
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, -0.72, 0);
    scene.add(plinth);

    // Warm Yellow Accent Ring
    const ringGeo = new THREE.RingGeometry(1.18, 1.2, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.75 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, -0.67, 0);
    scene.add(ring);

    // Fast & smooth 3D render loop with live cloth physics
    let animId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const time = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.05);

      if (modelGroupRef.current) {
        if (isAutoRotating && !isDragging.current) {
          modelGroupRef.current.rotation.y += 0.012;
        }

        if (!isDragging.current) {
          modelGroupRef.current.rotation.y += rotationVelocity.current.x;
          modelGroupRef.current.rotation.x += rotationVelocity.current.y;
          rotationVelocity.current.x *= 0.9;
          rotationVelocity.current.y *= 0.9;
        }

        // Calculate dynamic spin speed for centrifugal cloth flare
        const spinSpeed = Math.abs(rotationVelocity.current.x) + (isAutoRotating ? 0.014 : 0);
        updateGarmentClothPhysics(modelGroupRef.current, {
          time,
          delta,
          windStrength: 0.95,
          centrifugal: Math.min(spinSpeed * 5.0, 0.4),
          impulseX: rotationVelocity.current.x * 2.5,
          impulseZ: rotationVelocity.current.y * 1.8
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    previousPointer.current = { x: e.clientX, y: e.clientY };
    rotationVelocity.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !modelGroupRef.current) return;
    const deltaX = e.clientX - previousPointer.current.x;
    const deltaY = e.clientY - previousPointer.current.y;

    const rotSpeed = 0.012;
    modelGroupRef.current.rotation.y += deltaX * rotSpeed;
    modelGroupRef.current.rotation.x += deltaY * rotSpeed;
    modelGroupRef.current.rotation.x = Math.max(-0.45, Math.min(0.45, modelGroupRef.current.rotation.x));

    rotationVelocity.current = { x: deltaX * 0.003, y: deltaY * 0.003 };
    previousPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleSelectAngle = (idx: number) => {
    setActiveAngleIndex(idx);
    setIsAutoRotating(false);
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.set(0, productAngles[idx]?.rotY ?? 0, 0);
      rotationVelocity.current = { x: 0, y: 0 };
    }
  };

  const currentAngle = productAngles[activeAngleIndex] || productAngles[0];

  return (
    <div className="relative w-full h-[410px] md:h-[480px] bg-neutral-100/70 rounded-2xl overflow-hidden border border-neutral-200 shadow-inner flex flex-col">
      {/* 3D Canvas Mode */}
      <div
        ref={containerRef}
        className={`w-full flex-1 cursor-grab active:cursor-grabbing select-none ${
          viewMode === '3d' ? 'block' : 'hidden'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Actual 2D Uploaded Angle Photo Mode (Clean high-res studio) */}
      {viewMode === 'photo' && (
        <div className="w-full flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-neutral-50 to-neutral-100">
          <img
            src={currentAngle.image}
            alt={`${product.name} - ${currentAngle.title}`}
            className="max-h-full max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)]"
          />
        </div>
      )}

      {/* Top Left View Switcher */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 p-1 bg-neutral-950/95 backdrop-blur-md rounded-lg border border-neutral-800 shadow-lg z-10">
        <button
          onClick={() => setViewMode('3d')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
            viewMode === '3d'
              ? 'bg-yellow-400 text-neutral-950 shadow-sm font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Interactive 3D</span>
        </button>
        <button
          onClick={() => setViewMode('photo')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
            viewMode === 'photo'
              ? 'bg-yellow-400 text-neutral-950 shadow-sm font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Angle Photos</span>
        </button>
      </div>

      {/* Top Right Controls: Auto-Rotate and Fine-Tune Alignment */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        {viewMode === '3d' && (
          <>
            <button
              onClick={() => setShowCalibrationPanel(!showCalibrationPanel)}
              aria-label="Fine-tune garment alignment on hanger"
              title="Fine-tune position (x, y, z), rotation & scale offsets"
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border shadow-md backdrop-blur-md cursor-pointer ${
                showCalibrationPanel
                  ? 'bg-yellow-400 text-neutral-950 border-yellow-400 font-bold'
                  : 'bg-neutral-950/90 text-neutral-300 border-neutral-800 hover:text-yellow-400'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Align Model</span>
            </button>

            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              aria-label={isAutoRotating ? 'Pause rotation' : 'Start auto-rotation'}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border shadow-md backdrop-blur-md cursor-pointer ${
                isAutoRotating
                  ? 'bg-yellow-400 text-neutral-950 border-yellow-400 font-bold'
                  : 'bg-neutral-950/90 text-neutral-300 border-neutral-800 hover:text-yellow-400'
              }`}
            >
              <RotateCw className={`w-3 h-3 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <span>{isAutoRotating ? 'Spinning' : '360°'}</span>
            </button>
          </>
        )}
      </div>

      {/* Floating 3D Garment Calibration & Offset Fine-Tuning Overlay */}
      {viewMode === '3d' && showCalibrationPanel && (
        <div className="absolute top-12 right-3 w-80 max-h-[82%] overflow-y-auto bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl p-3.5 z-30 text-white text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2.5">
            <div>
              <h4 className="font-bold text-yellow-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-400" />
                Hanger Offset Alignment
              </h4>
              <p className="text-[10px] text-neutral-400">Fine-tune .glb / 3D model resting fit</p>
            </div>
            <button
              onClick={() => setShowCalibrationPanel(false)}
              className="text-neutral-500 hover:text-white p-1 rounded-md text-sm"
            >
              ✕
            </button>
          </div>

          {/* Quick Preset Action Buttons */}
          <div className="flex items-center gap-1.5 mb-3">
            <button
              onClick={() => {
                setOffsets((prev) => ({
                  ...prev,
                  position: { ...prev.position, y: -0.560, x: 0.000, z: 0.000 },
                  rotation: { x: 0, y: 0, z: 0 }
                }));
              }}
              className="flex-1 py-1 px-2 rounded-lg bg-neutral-900 text-white text-[10px] font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Rest on Hanger
            </button>
            <button
              onClick={() => {
                setOffsets((prev) => ({
                  ...prev,
                  rotation: { x: 0, y: 0, z: 0 }
                }));
              }}
              className="flex-1 py-1 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-semibold transition-colors cursor-pointer"
            >
              Hang Straight
            </button>
            <button
              onClick={() => {
                setOffsets({
                  position: { ...GARMENT_MANUAL_OFFSETS.position },
                  rotation: { ...GARMENT_MANUAL_OFFSETS.rotation },
                  scale: { ...GARMENT_MANUAL_OFFSETS.scale }
                });
              }}
              title="Reset to exposed code defaults"
              className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sliders Section */}
          <div className="space-y-2.5">
            {/* Position Y (Shift down onto hanger) */}
            <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-200/60">
              <div className="flex justify-between items-center text-[11px] font-semibold text-neutral-800 mb-1">
                <span>Vertical Collar (Y-Axis)</span>
                <span className="font-mono text-neutral-900 bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-[10px]">
                  {offsets.position.y.toFixed(3)}m
                </span>
              </div>
              <input
                type="range"
                min="-0.800"
                max="0.050"
                step="0.005"
                value={offsets.position.y}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOffsets((prev) => ({
                    ...prev,
                    position: { ...prev.position, y: val }
                  }));
                }}
                className="w-full accent-neutral-900 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 mt-0.5">
                <span>Lower onto hanger (-0.80m)</span>
                <span>Higher (+0.05m)</span>
              </div>
            </div>

            {/* Position X (Lateral) */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-neutral-700 mb-1">
                <span>Lateral Shift (X-Axis)</span>
                <span className="font-mono text-[10px] text-neutral-600">
                  {offsets.position.x.toFixed(3)}m
                </span>
              </div>
              <input
                type="range"
                min="-0.150"
                max="0.150"
                step="0.005"
                value={offsets.position.x}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOffsets((prev) => ({
                    ...prev,
                    position: { ...prev.position, x: val }
                  }));
                }}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            {/* Position Z (Depth) */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-neutral-700 mb-1">
                <span>Depth Forward/Back (Z-Axis)</span>
                <span className="font-mono text-[10px] text-neutral-600">
                  {offsets.position.z.toFixed(3)}m
                </span>
              </div>
              <input
                type="range"
                min="-0.150"
                max="0.150"
                step="0.005"
                value={offsets.position.z}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOffsets((prev) => ({
                    ...prev,
                    position: { ...prev.position, z: val }
                  }));
                }}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            {/* Rotation Z (Roll: level shoulders) */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-neutral-700 mb-1">
                <span>Shoulder Tilt (Roll / Rot Z)</span>
                <span className="font-mono text-[10px] text-neutral-600">
                  {offsets.rotation.z.toFixed(2)} rad
                </span>
              </div>
              <input
                type="range"
                min="-0.30"
                max="0.30"
                step="0.01"
                value={offsets.rotation.z}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOffsets((prev) => ({
                    ...prev,
                    rotation: { ...prev.rotation, z: val }
                  }));
                }}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            {/* Scale */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-neutral-700 mb-1">
                <span>Scale Multiplier</span>
                <span className="font-mono text-[10px] text-neutral-600">
                  {offsets.scale.y.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="1.25"
                step="0.01"
                value={offsets.scale.y}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOffsets((prev) => ({
                    ...prev,
                    scale: { x: val, y: val, z: val }
                  }));
                }}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>
          </div>

          {/* Copy Values to Code */}
          <div className="mt-3 pt-2.5 border-t border-neutral-200/70 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                const snippet = `export const GARMENT_MANUAL_OFFSETS = {
  position: { x: ${offsets.position.x.toFixed(3)}, y: ${offsets.position.y.toFixed(3)}, z: ${offsets.position.z.toFixed(3)} },
  rotation: { x: ${offsets.rotation.x.toFixed(3)}, y: ${offsets.rotation.y.toFixed(3)}, z: ${offsets.rotation.z.toFixed(3)} },
  scale: { x: ${offsets.scale.x.toFixed(2)}, y: ${offsets.scale.y.toFixed(2)}, z: ${offsets.scale.z.toFixed(2)} },
  glbModelPath: '${GARMENT_MANUAL_OFFSETS.glbModelPath}'
};`;
                navigator.clipboard.writeText(snippet);
                setCopyCodeSuccess(true);
                setTimeout(() => setCopyCodeSuccess(false), 2400);
              }}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copyCodeSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code Offsets</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Bar: 5-Angle Selector with Preview Thumbnails */}
      <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-neutral-200 shadow-sm z-10">
        {/* Active Angle Info */}
        <div className="hidden sm:flex items-center gap-2 pl-1.5 text-[11px] font-semibold text-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentAngle.title}</span>
        </div>

        {/* 5-Angle Selector Buttons */}
        <div className="flex items-center gap-1 mx-auto sm:mx-0 overflow-x-auto py-0.5">
          {productAngles.map((angle, idx) => (
            <button
              key={angle.id}
              onClick={() => handleSelectAngle(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeAngleIndex === idx
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
              title={angle.title}
            >
              <img
                src={angle.image}
                alt={angle.label}
                className="w-4 h-4 object-contain rounded-xs bg-white/30"
              />
              <span>{angle.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
