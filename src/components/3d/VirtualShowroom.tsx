import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { Product, DepartmentId } from '../../types/store';
import { PRODUCTS, CAMERA_PRESETS } from '../../data/products';
import {
  createCrownOfThornsApparelMesh,
  createClothingRail,
  createCrownOfThornsBrandLogo,
  createShoeWallElements,
  createCapWallElements,
  createShowroomArchitecturalElements,
  updateGarmentClothPhysics,
  GarmentTransformOffsets
} from './geometries';
import { soundManager } from '../../audio/soundManager';

// ============================================================================
// SHOWROOM 3D GARMENT (.GLB / MESH) MANUAL POSITION, ROTATION & SCALE OFFSETS
// Fine-tune these variables to adjust garment alignment on the showroom rail hanger:
//
// - POSITION: Shift down on the Y-axis so the collar rests directly on the hanger bar
// - ROTATION: Adjust angles (0 = hangs completely straight)
// - SCALE: Adjust dimensions (1.0 = standard true-to-scale sizing)
// ============================================================================

export const SHOWROOM_GARMENT_OFFSETS: GarmentTransformOffsets & { glbModelPath: string } = {
  // Manual position offset [x, y, z] in meters
  // Negative Y shifts the model DOWNWARD onto the contoured wooden hanger bar.
  position: {
    x: 0.00,       // Lateral offset (left / right)
    y: -0.560,     // Vertical offset: shifted down on Y-axis so collar rests cleanly on hanger bar
    z: 0.00        // Depth offset (front / back)
  },

  // Manual rotation offset [x, y, z] in radians
  // (0, 0, 0) hangs straight down
  rotation: {
    x: 0.00,
    y: 0.00,
    z: 0.00
  },

  // Manual scale offset [x, y, z]
  scale: {
    x: 1.00,
    y: 1.00,
    z: 1.00
  },

  // Optional custom .glb file path
  glbModelPath: '/models/garment.glb'
};

// Direct export constants for easy single-value inspection/tuning:
export const SHOWROOM_GARMENT_POS_X = SHOWROOM_GARMENT_OFFSETS.position.x;
export const SHOWROOM_GARMENT_POS_Y = SHOWROOM_GARMENT_OFFSETS.position.y; // Shift down on y-axis
export const SHOWROOM_GARMENT_POS_Z = SHOWROOM_GARMENT_OFFSETS.position.z;

export const SHOWROOM_GARMENT_ROT_X = SHOWROOM_GARMENT_OFFSETS.rotation.x;
export const SHOWROOM_GARMENT_ROT_Y = SHOWROOM_GARMENT_OFFSETS.rotation.y; // Hangs straight
export const SHOWROOM_GARMENT_ROT_Z = SHOWROOM_GARMENT_OFFSETS.rotation.z;

export const SHOWROOM_GARMENT_SCALE_X = SHOWROOM_GARMENT_OFFSETS.scale.x;
export const SHOWROOM_GARMENT_SCALE_Y = SHOWROOM_GARMENT_OFFSETS.scale.y;
export const SHOWROOM_GARMENT_SCALE_Z = SHOWROOM_GARMENT_OFFSETS.scale.z;

export const SHOWROOM_GARMENT_GLB_URL = SHOWROOM_GARMENT_OFFSETS.glbModelPath;

interface ProductPhysicsItem {
  itemKey: string;
  group: THREE.Group;
  product: Product;
  isEmpty?: boolean;
  baseRotY: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  hoverFactor: number;
  velZ: number;
  velRotY: number;
  pendulumAngleZ: number;
  pendulumVelZ: number;
  pendulumAngleX: number;
  pendulumVelX: number;
  phaseOffset: number;
  impulseX: number;
  impulseZ: number;
  // Dynamic Drag State
  isGrabbed: boolean;
  dragDisplacementX: number;
  dragDisplacementZ: number;
  dragDeltaX: number;
  dragDeltaZ: number;
  dragVelocityX: number;
  dragVelocityZ: number;
}

interface VirtualShowroomProps {
  activeDepartment: DepartmentId;
  onSelectProduct: (product: Product) => void;
  onHoverProduct: (product: Product | null, screenPos: { x: number; y: number } | null) => void;
}

export const VirtualShowroom: React.FC<VirtualShowroomProps> = ({
  activeDepartment,
  onSelectProduct,
  onHoverProduct
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Clothing physics airflow mode
  const [windPreset, setWindPreset] = useState<'breeze' | 'gentle' | 'still'>('breeze');
  const windStrengthRef = useRef(1.15);
  const [activeDragProduct, setActiveDragProduct] = useState<string | null>(null);

  useEffect(() => {
    windStrengthRef.current = windPreset === 'still' ? 0.0 : windPreset === 'gentle' ? 0.6 : 1.25;
  }, [windPreset]);

  // Fast & smooth camera targets
  const targetCamPos = useRef(new THREE.Vector3(...CAMERA_PRESETS.all.position));
  const targetCamLook = useRef(new THREE.Vector3(...CAMERA_PRESETS.all.target));
  const currentCamLook = useRef(new THREE.Vector3(...CAMERA_PRESETS.all.target));

  // User manual camera drag/orbit state
  const isDraggingCamera = useRef(false);
  const previousCameraMousePosition = useRef({ x: 0, y: 0 });
  const orbitAngle = useRef({ theta: 0, phi: 0 });
  const isUserInteracting = useRef(false);
  const userInteractionTimeout = useRef<number | null>(null);

  // Product mesh interactive references with physical simulation state
  const productMeshesRef = useRef<Map<string, ProductPhysicsItem>>(new Map());
  const hoveredProductId = useRef<string | null>(null);

  // Interactive mouse-drag garment touch state
  const draggedItemRef = useRef<ProductPhysicsItem | null>(null);
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef(0);
  const smoothDragVelocity = useRef({ x: 0, y: 0 });

  // Reusable raycaster & vector to prevent GC lag during mouse/touch interaction
  const raycaster = useRef(new THREE.Raycaster());
  const mouseVector = useRef(new THREE.Vector2());

  // Camera positioning helper with dynamic mobile viewport detection
  const getCameraPositionForDepartment = (dept: DepartmentId): [number, number, number] => {
    const preset = CAMERA_PRESETS[dept] || CAMERA_PRESETS.all;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const pos = [...preset.position] as [number, number, number];
    if (isMobile) {
      if (dept === 'all') {
        pos[2] = 3.4; // Pull back camera on mobile so entire rail and logo stay in frame
      } else if (dept === 'clothing') {
        pos[2] = -1.1; // Pull back slightly on mobile for vertical aspect ratios
      }
    }
    return pos;
  };

  // Fast camera jump on department change
  useEffect(() => {
    const preset = CAMERA_PRESETS[activeDepartment];
    if (preset) {
      const pos = getCameraPositionForDepartment(activeDepartment);
      targetCamPos.current.set(...pos);
      targetCamLook.current.set(...preset.target);
      orbitAngle.current = { theta: 0, phi: 0 };
      isUserInteracting.current = false;
      soundManager.playCameraTransition();
    }
  }, [activeDepartment]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene: Seamless Streetwear Warm Yellow studio showroom
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xfacc15); // Streetwear warm yellow
    scene.fog = new THREE.FogExp2(0xfacc15, 0.022);

    // 2. Camera setup with mobile vertical viewport compensation
    const camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / container.clientHeight,
      0.1,
      40
    );
    const initialPos = getCameraPositionForDepartment(activeDepartment);
    camera.position.set(...initialPos);
    targetCamPos.current.set(...initialPos);
    camera.lookAt(...(CAMERA_PRESETS[activeDepartment]?.target || CAMERA_PRESETS.all.target));
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. High-Fidelity PBR Architectural Gallery Lighting & Soft Rim System
    // Premium soft ambient base fill that keeps retail space luminous and inviting
    const ambientLight = new THREE.AmbientLight(0xfffdfa, 1.8);
    scene.add(ambientLight);

    // Clean, Uniform Commercial Studio Lighting with Soft Drop Shadows
    const mainSun = new THREE.DirectionalLight(0xffffff, 0.8);
    mainSun.position.set(0.6, 4.8, -1.4);
    mainSun.target.position.set(0, 2.1, -4.3);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 1024;
    mainSun.shadow.mapSize.height = 1024;
    mainSun.shadow.camera.near = 0.5;
    mainSun.shadow.camera.far = 10;
    mainSun.shadow.camera.left = -5.5;
    mainSun.shadow.camera.right = 5.5;
    mainSun.shadow.camera.top = 4.5;
    mainSun.shadow.camera.bottom = -4.5;
    mainSun.shadow.bias = -0.0004;
    mainSun.shadow.radius = 8; // Soft drop shadows cast against the minimalist wall behind rail
    scene.add(mainSun);
    scene.add(mainSun.target);

    // Overhead focused gallery spotlight sweeping the main garment rail
    const spotRail = new THREE.SpotLight(0xfffdf6, 1.45, 15, Math.PI / 2.8, 0.45, 1);
    spotRail.position.set(0, 4.6, -1.0);
    spotRail.target.position.set(0, 2.1, -4.3);
    spotRail.castShadow = true;
    scene.add(spotRail);
    scene.add(spotRail.target);

    // SOFT RIM LIGHTING SYSTEM FOR CLOTHING RACKS:
    // 1. Back Rim/Silhouette Light behind the garment rack to highlight fabric edges & weave texture
    const rackRimBack = new THREE.DirectionalLight(0xfff8ee, 1.25);
    rackRimBack.position.set(0, 2.6, -4.92); // Positioned between back wall and rail pointing forward
    rackRimBack.target.position.set(0, 2.0, -4.0);
    scene.add(rackRimBack);
    scene.add(rackRimBack.target);

    // 2. Left Edge Rim Light (Grazing left shoulders and fabric silhouettes)
    const rackRimLeft = new THREE.DirectionalLight(0xfff9f2, 0.95);
    rackRimLeft.position.set(-4.2, 3.2, -3.8);
    rackRimLeft.target.position.set(0, 2.0, -4.3);
    scene.add(rackRimLeft);
    scene.add(rackRimLeft.target);

    // 3. Right Edge Rim Light (Grazing right shoulders and fabric silhouettes)
    const rackRimRight = new THREE.DirectionalLight(0xfff9f2, 0.95);
    rackRimRight.position.set(4.2, 3.2, -3.8);
    rackRimRight.target.position.set(0, 2.0, -4.3);
    scene.add(rackRimRight);
    scene.add(rackRimRight.target);

    // 4. Subtle Architectural Under-Cove Uplight along floor under the rack
    const underRackRim = new THREE.PointLight(0xffeedb, 0.7, 5, 1.2);
    underRackRim.position.set(0, 0.35, -4.3);
    scene.add(underRackRim);

    // Wall signage accent spotlight
    const spotLogo = new THREE.SpotLight(0xfff6e6, 1.35, 8, Math.PI / 4, 0.28, 1);
    spotLogo.position.set(0, 4.2, -2.8);
    spotLogo.target.position.set(0, 3.25, -4.9);
    scene.add(spotLogo);
    scene.add(spotLogo.target);

    // Right wall footwear showcase spotlight
    const spotRight = new THREE.SpotLight(0xffffff, 1.15, 10, Math.PI / 4, 0.35, 1);
    spotRight.position.set(1.8, 4.0, 0);
    spotRight.target.position.set(4.4, 2.0, 0);
    scene.add(spotRight);
    scene.add(spotRight.target);

    // Left wall headwear spotlight
    const spotLeft = new THREE.SpotLight(0xffffff, 1.15, 10, Math.PI / 4, 0.35, 1);
    spotLeft.position.set(-1.8, 4.0, -0.3);
    spotLeft.target.position.set(-4.4, 2.0, -0.3);
    scene.add(spotLeft);
    scene.add(spotLeft.target);

    // 5. Seamless "Infinite Yellow" Streetwear Studio Architecture
    // Floor: Smooth polished warm streetwear yellow (0xfacc15) with soft reflections
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.32,
      metalness: 0.08
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle luxury floor expansion seams in tone-on-tone warm yellow
    for (let x = -4; x <= 4; x += 2) {
      const seamGeo = new THREE.PlaneGeometry(0.012, 12);
      seamGeo.rotateX(-Math.PI / 2);
      const seamMat = new THREE.MeshBasicMaterial({ color: 0xca8a04 });
      const seam = new THREE.Mesh(seamGeo, seamMat);
      seam.position.set(x, 0.001, 0);
      scene.add(seam);
    }

    // Ceiling: Matching seamless yellow ceiling (0xfacc15)
    const ceilingGeo = new THREE.PlaneGeometry(12, 12);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.95 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 4.6;
    scene.add(ceiling);

    // Walls: Smooth seamless streetwear yellow (0xfacc15)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Exact same warm yellow (0xfacc15)
      roughness: 0.94,
      metalness: 0.02
    });

    // Back Wall
    const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.6), wallMat);
    wallBack.position.set(0, 2.3, -4.95);
    wallBack.receiveShadow = true;
    scene.add(wallBack);

    // Right Wall (Shoes & Shelves)
    const wallRight = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.6), wallMat);
    wallRight.rotation.y = -Math.PI / 2;
    wallRight.position.set(4.95, 2.3, 0);
    wallRight.receiveShadow = true;
    scene.add(wallRight);

    // Left Wall (Caps & Pegboard)
    const wallLeft = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.6), wallMat);
    wallLeft.rotation.y = Math.PI / 2;
    wallLeft.position.set(-4.95, 2.3, 0);
    wallLeft.receiveShadow = true;
    scene.add(wallLeft);

    // Front Wall
    const wallFront = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.6), wallMat);
    wallFront.rotation.y = Math.PI;
    wallFront.position.set(0, 2.3, 4.95);
    scene.add(wallFront);

    // 6. Build Crown of Thorns Showroom Elements
    const rail = createClothingRail();
    scene.add(rail);

    const brandLogo = createCrownOfThornsBrandLogo();
    scene.add(brandLogo);

    const shoeWall = createShoeWallElements();
    scene.add(shoeWall);

    const capWall = createCapWallElements();
    scene.add(capWall);

    const architecturalDetails = createShowroomArchitecturalElements();
    scene.add(architecturalDetails);

    // 7. Populate the clothing products on the rack with accurate offsets and models
    const productMap = new Map<string, ProductPhysicsItem>();
    const baseRotY = Math.PI / 2; // Sideways down rail at rest

    PRODUCTS.forEach((product, idx) => {
      const colorway = product.colorways[product.defaultColorIndex];
      const mesh = createCrownOfThornsApparelMesh(
        product,
        colorway,
        false,
        false,
        product.garmentOffsets
      );
      const posX = product.position[0];
      const posY = product.position[1];
      const posZ = product.position[2];

      mesh.position.set(posX, posY, posZ);
      mesh.rotation.set(0, baseRotY, 0);

      const itemKey = product.id;
      Object.assign(mesh.userData, { itemKey, productId: product.id, product, isEmpty: false });
      mesh.traverse((child) => {
        if (child !== mesh) {
          Object.assign(child.userData, { itemKey, productId: product.id, product, isEmpty: false });
        }
      });

      scene.add(mesh);
      productMap.set(itemKey, {
        itemKey,
        group: mesh,
        product,
        isEmpty: false,
        baseRotY,
        baseX: posX,
        baseY: posY,
        baseZ: posZ,
        hoverFactor: 0,
        velZ: 0,
        velRotY: 0,
        pendulumAngleZ: 0,
        pendulumVelZ: 0,
        pendulumAngleX: 0,
        pendulumVelX: 0,
        phaseOffset: idx * 0.9,
        impulseX: 0,
        impulseZ: 0,
        isGrabbed: false,
        dragDisplacementX: 0,
        dragDisplacementZ: 0,
        dragDeltaX: 0,
        dragDeltaZ: 0,
        dragVelocityX: 0,
        dragVelocityZ: 0
      });
    });

    // Empty Minimalist Contoured Matte-Black Wooden Hangers with Silver Hooks for remaining slots
    const emptySlotPositions = [-1.4, -1.1, -0.4, 0.4, 1.1, 1.4];
    const dummyProduct = PRODUCTS[0];
    const dummyColorway = dummyProduct.colorways[dummyProduct.defaultColorIndex];
    emptySlotPositions.forEach((xPos, idx) => {
      const emptyHanger = createCrownOfThornsApparelMesh(dummyProduct, dummyColorway, false, true);
      emptyHanger.position.set(xPos, 2.00, -4.3);
      emptyHanger.rotation.set(0, Math.PI / 2, 0);

      const slotId = `empty-hanger-slot-${idx}`;
      Object.assign(emptyHanger.userData, { itemKey: slotId, productId: slotId, product: dummyProduct, isEmpty: true });
      emptyHanger.traverse((child) => {
        if (child !== emptyHanger) {
          Object.assign(child.userData, { itemKey: slotId, productId: slotId, product: dummyProduct, isEmpty: true });
        }
      });

      scene.add(emptyHanger);
      productMap.set(slotId, {
        itemKey: slotId,
        group: emptyHanger,
        product: dummyProduct,
        isEmpty: true,
        baseRotY: Math.PI / 2,
        baseX: xPos,
        baseY: 2.00,
        baseZ: -4.3,
        hoverFactor: 0,
        velZ: 0,
        velRotY: 0,
        pendulumAngleZ: 0,
        pendulumVelZ: 0,
        pendulumAngleX: 0,
        pendulumVelX: 0,
        phaseOffset: (idx + 1) * 1.35,
        impulseX: 0,
        impulseZ: 0,
        isGrabbed: false,
        dragDisplacementX: 0,
        dragDisplacementZ: 0,
        dragDeltaX: 0,
        dragDeltaZ: 0,
        dragVelocityX: 0,
        dragVelocityZ: 0
      });
    });

    productMeshesRef.current = productMap;

    // 8. 60FPS Physics Simulation & Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth camera interpolation
      if (!isDraggingCamera.current) {
        camera.position.lerp(targetCamPos.current, 0.12);
      }

      const currentTarget = targetCamLook.current.clone();
      if (isUserInteracting.current) {
        currentTarget.x += Math.sin(orbitAngle.current.theta) * 1.5;
        currentTarget.y += Math.sin(orbitAngle.current.phi) * 0.8;
      }
      currentCamLook.current.lerp(currentTarget, 0.14);
      camera.lookAt(currentCamLook.current);

      // Real-time clothing physics on all garments
      productMap.forEach((item, itemKey) => {
        const { group, baseRotY, baseX, baseY, baseZ } = item;
        const isHovered = hoveredProductId.current === itemKey && !draggedItemRef.current;
        const isGrabbed = draggedItemRef.current?.itemKey === itemKey;

        const oldZ = group.position.z;
        const oldRotY = group.rotation.y;

        // Strict, clean retail showroom interpolation (Nike Virtual Showroom style):
        // At Rest: Stays locked to baseX, baseY, baseZ, baseRotY (hanging sideways)
        // On Hover / Touch (isHovered or isGrabbed): Smoothly and strictly rotates to exactly 0 radians (facing camera head-on) and translates to baseZ + 0.45
        const isInteracted = isHovered || isGrabbed;
        const targetRotY = isInteracted ? 0 : baseRotY;
        const targetZ = isInteracted ? baseZ + 0.45 : baseZ;
        const targetX = baseX;
        const targetY = baseY;

        item.hoverFactor = THREE.MathUtils.lerp(item.hoverFactor, isInteracted ? 1.0 : 0.0, 0.14);

        // Smooth translation & rotation interpolation
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 0.14);
        group.position.z = THREE.MathUtils.lerp(group.position.z, targetZ, 0.14);
        group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, 0.14);
        group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.14);

        // Zero out all pendulum tilts so the garment does not tilt or swing wildly; disable structural hanger swinging
        group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, 0.18);
        group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0, 0.18);

        item.pendulumAngleZ = 0;
        item.pendulumAngleX = 0;
        item.pendulumVelZ = 0;
        item.pendulumVelX = 0;
        item.dragDisplacementX = 0;
        item.dragDisplacementZ = 0;
        item.dragDeltaX = 0;
        item.dragDeltaZ = 0;
        item.dragVelocityX = 0;
        item.dragVelocityZ = 0;

        // Derive physical velocity (units / sec)
        item.velZ = (group.position.z - oldZ) / Math.max(delta, 0.001);
        item.velRotY = (group.rotation.y - oldRotY) / Math.max(delta, 0.001);

        // Dampen external impulses
        item.impulseX = 0;
        item.impulseZ = 0;

        // Wrap updateGarmentClothPhysics in a conditional so it only runs if the garment is actively moving or hovered, saving massive CPU cycles
        const isActivelyMoving = Math.abs(item.velZ) > 0.001 || Math.abs(item.velRotY) > 0.001;
        const shouldSimulateCloth = isHovered || isGrabbed || item.hoverFactor > 0.005 || isActivelyMoving;

        if (shouldSimulateCloth && !item.isEmpty) {
          updateGarmentClothPhysics(group, {
            time,
            delta,
            phaseOffset: item.phaseOffset,
            windStrength: windStrengthRef.current,
            hoverFactor: item.hoverFactor,
            velZ: item.velZ,
            velRotY: item.velRotY,
            impulseX: 0,
            impulseZ: 0,
            isGrabbed,
            dragDeltaX: 0,
            dragDeltaZ: 0,
            dragVelocityX: 0,
            dragVelocityZ: 0
          });
        }
      });

      renderer.render(scene, camera);
    };

    render();

    // 9. Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 10. WebGL context safety
    const canvas = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost, awaiting restore');
    };
    const handleContextRestored = () => {
      render();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Pointer Down: Determine if user clicked a garment (to drag & sway) or background (to orbit)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast against products to see if user tapped a garment using cached refs
    mouseVector.current.set(mouseX, mouseY);
    raycaster.current.setFromCamera(mouseVector.current, camera);

    const interactiveObjects: THREE.Object3D[] = [];
    productMeshesRef.current.forEach(({ group }) => {
      interactiveObjects.push(group);
    });

    const intersects = raycaster.current.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData?.itemKey && !topObj.userData?.product) {
        topObj = topObj.parent;
      }

      if (topObj && (topObj.userData?.itemKey || topObj.userData?.product)) {
        const itemKey = (topObj.userData.itemKey || topObj.userData.productId || topObj.userData.product?.id) as string;
        const item = productMeshesRef.current.get(itemKey);
        if (item) {
          // INITIATE GARMENT TOUCH & DRAG
          draggedItemRef.current = item;
          item.isGrabbed = true;
          dragStartMouse.current = { x: e.clientX, y: e.clientY };
          lastMousePos.current = { x: e.clientX, y: e.clientY };
          dragStartTime.current = performance.now();
          smoothDragVelocity.current = { x: 0, y: 0 };

          setActiveDragProduct(item.product.id);
          soundManager.playClick(1400);

          container.style.cursor = 'grabbing';
          isDraggingCamera.current = false;
          return;
        }
      }
    }

    // Otherwise, initiate camera orbit
    isDraggingCamera.current = true;
    previousCameraMousePosition.current = { x: e.clientX, y: e.clientY };
    container.style.cursor = 'grabbing';
  };

  // Pointer Move: Drag garment or orbit camera or handle hover
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      if (!container || !camera) return;

      // 1. ACTIVE GARMENT TOUCH / DRAG
      if (draggedItemRef.current) {
        onHoverProduct(null, null);
        return;
      }

      // 2. ACTIVE CAMERA ORBIT
      if (isDraggingCamera.current) {
        const deltaX = e.clientX - previousCameraMousePosition.current.x;
        const deltaY = e.clientY - previousCameraMousePosition.current.y;

        orbitAngle.current.theta += deltaX * 0.0045;
        orbitAngle.current.phi -= deltaY * 0.0035;
        orbitAngle.current.phi = Math.max(-0.35, Math.min(0.35, orbitAngle.current.phi));

        isUserInteracting.current = true;
        previousCameraMousePosition.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // 3. HOVER DETECTION
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouseVector.current.set(mouseX, mouseY);
      raycaster.current.setFromCamera(mouseVector.current, camera);

      const interactiveObjects: THREE.Object3D[] = [];
      productMeshesRef.current.forEach(({ group }) => {
        interactiveObjects.push(group);
      });

      const intersects = raycaster.current.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !topObj.userData?.itemKey && !topObj.userData?.product) {
          topObj = topObj.parent;
        }

        if (topObj && (topObj.userData?.itemKey || topObj.userData?.product)) {
          const itemKey = (topObj.userData.itemKey || topObj.userData.productId || topObj.userData.product?.id) as string;
          const product = topObj.userData.product as Product;
          const isEmpty = Boolean(topObj.userData.isEmpty);

          if (hoveredProductId.current !== itemKey) {
            hoveredProductId.current = itemKey;
            soundManager.playClick(1200);
          }
          container.style.cursor = 'grab';
          if (!isEmpty) {
            onHoverProduct(product, { x: e.clientX, y: e.clientY });
          } else {
            onHoverProduct(null, null);
          }
          return;
        }
      }

      if (hoveredProductId.current !== null) {
        hoveredProductId.current = null;
        container.style.cursor = 'grab';
        onHoverProduct(null, null);
      }
    },
    [onHoverProduct]
  );

  // Pointer Up: Release garment or camera release
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;

    // 1. GARMENT TOUCH / DRAG RELEASE
    if (draggedItemRef.current) {
      const item = draggedItemRef.current;
      const totalDist = Math.hypot(
        e.clientX - dragStartMouse.current.x,
        e.clientY - dragStartMouse.current.y
      );
      const duration = performance.now() - dragStartTime.current;

      item.isGrabbed = false;
      draggedItemRef.current = null;
      setActiveDragProduct(null);

      // Tap / Click -> Select & inspect product modal
      if (totalDist < 12 && duration < 350) {
        if (!item.isEmpty) {
          soundManager.playClick(600);
          onSelectProduct(item.product);
        }
      } else {
        soundManager.playClothRustle(0.6);
      }

      if (container) {
        container.style.cursor = hoveredProductId.current ? 'grab' : 'grab';
      }
      return;
    }

    // 2. CAMERA DRAG RELEASE
    if (isDraggingCamera.current) {
      isDraggingCamera.current = false;
      if (container) {
        container.style.cursor = hoveredProductId.current ? 'grab' : 'grab';
      }

      if (userInteractionTimeout.current) {
        window.clearTimeout(userInteractionTimeout.current);
      }
      userInteractionTimeout.current = window.setTimeout(() => {
        isUserInteracting.current = false;
        orbitAngle.current = { theta: 0, phi: 0 };
      }, 6000);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const camera = cameraRef.current;
    if (!camera) return;

    const zoomDelta = e.deltaY * 0.003;
    const currentZ = targetCamPos.current.z;
    const newZ = Math.max(0.6, Math.min(4.8, currentZ + zoomDelta));
    targetCamPos.current.z = newZ;
  };

  // Snap directly to 45-degree three-quarter commercial retail showroom display
  const handleSnap45DegreeDisplay = () => {
    soundManager.playClick(800);
    // Camera coordinates framing the signature garment at center in strict 45-degree three-quarter perspective
    targetCamPos.current.set(0.68, 2.14, -2.62);
    targetCamLook.current.set(0.0, 2.02, -4.3);
    orbitAngle.current = { theta: 0, phi: 0 };
    isUserInteracting.current = false;
  };

  // Nudge the entire clothing rack to trigger an organic cascading physics wave
  const handleNudgeRail = () => {
    soundManager.playClothRustle(1.4);
    let idx = 0;
    productMeshesRef.current.forEach((item) => {
      const delay = idx * 70;
      setTimeout(() => {
        item.impulseZ = 0.58;
        item.impulseX = (idx % 2 === 0 ? 1 : -1) * 0.35;
        item.pendulumVelZ = (idx % 2 === 0 ? 1 : -1) * 2.8;
        item.pendulumVelX = 1.4;
      }, delay);
      idx++;
    });
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none touch-none overscroll-contain"
      style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
    >
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none overscroll-contain"
        style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        role="region"
        aria-label="Cactus Bear Interactive 3D Showroom"
      />

      {/* Real-Time Clothing Physics & Drag Interaction Bar */}
      <div className="absolute top-20 left-4 sm:left-6 z-20 pointer-events-auto">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-md text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-neutral-900">
            <span className={`w-2 h-2 rounded-full ${activeDragProduct ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <span>{activeDragProduct ? 'Swinging Hanger' : 'Garment & Hanger Physics'}</span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-200" />

          {/* 45° Commercial Showroom Display Button */}
          <button
            onClick={handleSnap45DegreeDisplay}
            className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-xl text-[11px] font-semibold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Snap to 45-degree three-quarter commercial showroom perspective"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            <span>45° Studio View</span>
          </button>

          <div className="h-4 w-[1px] bg-neutral-200" />

          {/* Airflow / Breeze selector */}
          <div className="flex items-center gap-0.5 bg-neutral-100 p-0.5 rounded-xl text-[10px] font-medium text-neutral-600">
            {(['breeze', 'gentle', 'still'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setWindPreset(preset)}
                className={`px-2 py-0.5 rounded-lg capitalize transition-all cursor-pointer ${
                  windPreset === preset
                    ? 'bg-white text-neutral-900 font-bold shadow-xs'
                    : 'hover:text-neutral-900'
                }`}
                title={`Airflow: ${preset}`}
              >
                {preset === 'still' ? 'Calm' : preset}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-neutral-200" />

          {/* Nudge Rail Button */}
          <button
            onClick={handleNudgeRail}
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[11px] font-semibold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
            title="Nudge the clothing rack to trigger an organic physics wave"
          >
            <span>Nudge Rail</span>
          </button>
        </div>
      </div>

      {/* Drag & Sway Interaction Hint Badge */}
      <div className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-full text-[11px] font-medium text-neutral-700 shadow-sm pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
        <span>Matte-Black Rail & Minimalist Hangers · 45° 3D Garment Display · Drag to Sway</span>
      </div>
    </div>
  );
};
