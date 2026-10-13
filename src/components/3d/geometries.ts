import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Colorway, Product } from '../../types/store';

// ============================================================================
// MANUAL 3D GARMENT (.GLB & MESH) CALIBRATION & OFFSET CONFIGURATION
// Fine-tune these variables to adjust garment alignment on the hanger.
// Shift down on the Y-axis so the collar rests directly on the contoured hanger,
// and set rotation so it hangs straight.
// ============================================================================
export interface GarmentTransformOffsets {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export const DEFAULT_GARMENT_POSITION_OFFSET = {
  x: 0.00,       // Lateral offset (centered on hanger)
  y: -0.560,     // Vertical offset: shifted down on the Y-axis so collar rests perfectly on hanger
  z: 0.00        // Depth offset
};

export const DEFAULT_GARMENT_ROTATION_OFFSET = {
  x: 0.00,       // Pitch tilt (0 = hangs straight)
  y: 0.00,       // Yaw orientation (0 = aligned straight with hanger)
  z: 0.00        // Roll tilt (0 = shoulders level)
};

export const DEFAULT_GARMENT_SCALE_OFFSET = {
  x: 1.00,       // Width multiplier
  y: 1.00,       // Height multiplier
  z: 1.00        // Depth multiplier
};

export const DEFAULT_GARMENT_OFFSETS: GarmentTransformOffsets = {
  position: { ...DEFAULT_GARMENT_POSITION_OFFSET },
  rotation: { ...DEFAULT_GARMENT_ROTATION_OFFSET },
  scale: { ...DEFAULT_GARMENT_SCALE_OFFSET }
};

export const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
gltfLoader.setDRACOLoader(dracoLoader);

const darkGunmetalMat = new THREE.MeshStandardMaterial({
  color: 0x121316,
  roughness: 0.32,
  metalness: 0.82
});

export const matteBlackWoodHangerMat = new THREE.MeshStandardMaterial({
  color: 0x141416, 
  roughness: 0.82,
  metalness: 0.04
});

export const matteBlackIndustrialSteelRailMat = new THREE.MeshStandardMaterial({
  color: 0x18181b, 
  roughness: 0.42,
  metalness: 0.85
});

export const silverMetalHookMat = new THREE.MeshStandardMaterial({
  color: 0xd6d8dc, 
  roughness: 0.22,
  metalness: 0.94
});

const satinChromeMat = new THREE.MeshStandardMaterial({
  color: 0xdcdfe4,
  roughness: 0.22,
  metalness: 0.92
});

const champagneBrassMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  roughness: 0.26,
  metalness: 0.88
});

const travertineMat = new THREE.MeshStandardMaterial({
  color: 0xf1efe9,
  roughness: 0.72,
  metalness: 0.04
});

const oakWoodMat = new THREE.MeshStandardMaterial({
  color: 0xd8b58a, 
  roughness: 0.55,
  metalness: 0.05
});

const whiteShelfMat = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.38,
  metalness: 0.82
});

const textureLoader = new THREE.TextureLoader();

export function createCrownOfThornsApparelMesh(
  product: Product,
  _colorway: Colorway,
  isDetailedPDP = false,
  isEmptyHanger = false,
  customOffsets?: Partial<GarmentTransformOffsets>
): THREE.Group {
  const group = new THREE.Group();

  const hangerGroup = new THREE.Group();
  hangerGroup.name = 'hanger';

  const hookShape = new THREE.CurvePath<THREE.Vector3>();
  const hookCurve1 = new THREE.LineCurve3(
    new THREE.Vector3(0, 0.485, 0),
    new THREE.Vector3(0, 0.558, 0)
  );
  const hookCurve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.558, 0),
    new THREE.Vector3(0.012, 0.616, 0),
    new THREE.Vector3(0.046, 0.612, 0),
    new THREE.Vector3(0.054, 0.540, 0)
  );
  hookShape.add(hookCurve1);
  hookShape.add(hookCurve2);

  const hookGeo = new THREE.TubeGeometry(hookShape, 40, 0.0085, 16, false);
  const hookMesh = new THREE.Mesh(hookGeo, silverMetalHookMat);
  hookMesh.castShadow = true;
  hangerGroup.add(hookMesh);

  const hookTipGeo = new THREE.SphereGeometry(0.011, 16, 16);
  const hookTipMesh = new THREE.Mesh(hookTipGeo, silverMetalHookMat);
  hookTipMesh.position.set(0.054, 0.540, 0);
  hangerGroup.add(hookTipMesh);

  const ferruleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.028, 20);
  const ferruleMesh = new THREE.Mesh(ferruleGeo, silverMetalHookMat);
  ferruleMesh.position.set(0, 0.485, 0);
  hangerGroup.add(ferruleMesh);

  const hangerBarLength = 0.72;
  const hangerCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-hangerBarLength * 0.5, 0.405, 0),
    new THREE.Vector3(0, 0.470, 0),
    new THREE.Vector3(hangerBarLength * 0.5, 0.405, 0)
  );
  const hangerBarGeo = new THREE.TubeGeometry(hangerCurve, 36, 0.021, 16, false);
  hangerBarGeo.scale(1, 0.78, 1.35); 
  const hangerBarMesh = new THREE.Mesh(hangerBarGeo, matteBlackWoodHangerMat);
  hangerBarMesh.castShadow = true;
  hangerGroup.add(hangerBarMesh);

  [-hangerBarLength * 0.5, hangerBarLength * 0.5].forEach((x) => {
    const capGeo = new THREE.SphereGeometry(0.023, 14, 14);
    capGeo.scale(0.92, 0.82, 1.32);
    const cap = new THREE.Mesh(capGeo, matteBlackWoodHangerMat);
    cap.position.set(x, 0.405, 0);
    hangerGroup.add(cap);
  });

  const strutLength = hangerBarLength * 0.88;
  const strutGeo = new THREE.CylinderGeometry(0.0065, 0.0065, strutLength, 16);
  strutGeo.rotateZ(Math.PI / 2);
  const strutMesh = new THREE.Mesh(strutGeo, matteBlackWoodHangerMat);
  strutMesh.position.set(0, 0.35, 0);
  hangerGroup.add(strutMesh);

  [-strutLength * 0.5, strutLength * 0.5].forEach((x) => {
    const bracketGeo = new THREE.CylinderGeometry(0.0095, 0.0095, 0.016, 12);
    bracketGeo.rotateZ(Math.PI / 2);
    const bracket = new THREE.Mesh(bracketGeo, silverMetalHookMat);
    bracket.position.set(x, 0.35, 0);
    hangerGroup.add(bracket);
  });

  hangerGroup.castShadow = true;
  group.add(hangerGroup);

  if (isEmptyHanger) {
    group.userData.hanger = hangerGroup;
    group.userData.frontCloth = undefined;
    group.userData.backCloth = undefined;

    const hitGeo = new THREE.BoxGeometry(hangerBarLength * 1.15, 0.55, 0.28);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.set(0, 0.38, 0);
    group.add(hitMesh);

    const baseScale = isDetailedPDP ? 1.45 : 1.08;
    group.scale.set(baseScale, baseScale, baseScale);
    return group;
  }

  const garmentGroup = new THREE.Group();
  garmentGroup.name = 'draped-garment';

  const defaultForProduct = product.garmentOffsets || {};
  const posX = customOffsets?.position?.x ?? defaultForProduct.position?.x ?? DEFAULT_GARMENT_POSITION_OFFSET.x;
  const posY = customOffsets?.position?.y ?? defaultForProduct.position?.y ?? DEFAULT_GARMENT_POSITION_OFFSET.y;
  const posZ = customOffsets?.position?.z ?? defaultForProduct.position?.z ?? DEFAULT_GARMENT_POSITION_OFFSET.z;

  const rotX = customOffsets?.rotation?.x ?? defaultForProduct.rotation?.x ?? DEFAULT_GARMENT_ROTATION_OFFSET.x;
  const rotY = customOffsets?.rotation?.y ?? defaultForProduct.rotation?.y ?? DEFAULT_GARMENT_ROTATION_OFFSET.y;
  const rotZ = customOffsets?.rotation?.z ?? defaultForProduct.rotation?.z ?? DEFAULT_GARMENT_ROTATION_OFFSET.z;

  const sclX = customOffsets?.scale?.x ?? defaultForProduct.scale?.x ?? DEFAULT_GARMENT_SCALE_OFFSET.x;
  const sclY = customOffsets?.scale?.y ?? defaultForProduct.scale?.y ?? DEFAULT_GARMENT_SCALE_OFFSET.y;
  const sclZ = customOffsets?.scale?.z ?? defaultForProduct.scale?.z ?? DEFAULT_GARMENT_SCALE_OFFSET.z;

  garmentGroup.position.set(posX, posY, posZ);
  garmentGroup.rotation.set(rotX, rotY, rotZ);
  garmentGroup.scale.set(sclX, sclY, sclZ);

  const proceduralGroup = new THREE.Group();
  proceduralGroup.name = 'procedural-panels';
  // Hide fallback while loading to prevent flash of unstyled content glitch; only shown on load error
  proceduralGroup.visible = false;
  // Compensates vertical offset so procedural collar fallback rests directly on hanger
  proceduralGroup.position.set(0, 0.48, 0);
  garmentGroup.add(proceduralGroup);

  const url3Quarter = product.angleImages?.threeQuarter || '/products/angle-45-three-quarter.png';
  const urlSideLeft = product.angleImages?.sideLeft || '/products/angle-side-left.png';
  const urlSideRight = product.angleImages?.sideRight || '/products/angle-side-right.png';
  const urlBack = product.angleImages?.back || '/products/angle-back.png';
  const urlFront = product.angleImages?.front || '/products/angle-front.png';

  const tex3Quarter = textureLoader.load(url3Quarter);
  tex3Quarter.colorSpace = THREE.SRGBColorSpace;

  const texSideLeft = textureLoader.load(urlSideLeft);
  texSideLeft.colorSpace = THREE.SRGBColorSpace;

  const texSideRight = textureLoader.load(urlSideRight);
  texSideRight.colorSpace = THREE.SRGBColorSpace;

  const texBack = textureLoader.load(urlBack);
  texBack.colorSpace = THREE.SRGBColorSpace;

  const texFront = textureLoader.load(urlFront);
  texFront.colorSpace = THREE.SRGBColorSpace;

  const fabricFrontMat = new THREE.MeshStandardMaterial({
    map: tex3Quarter,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.94, 
    metalness: 0.01,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  });

  const fabricBackMat = new THREE.MeshStandardMaterial({
    map: texBack,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.95,
    metalness: 0.01,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  });

  const fabricSideLeftMat = new THREE.MeshStandardMaterial({
    map: texSideLeft,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.94,
    metalness: 0.01,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  });

  const fabricSideRightMat = new THREE.MeshStandardMaterial({
    map: texSideRight,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.94,
    metalness: 0.01,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  });

  const clothW = 0.74;
  const clothH = 1.04;
  const segX = 12;
  const segY = 18;
  const frontGeo = new THREE.PlaneGeometry(clothW, clothH, segX, segY);

  const frontPos = frontGeo.attributes.position;
  const originalX: number[] = [];
  const originalY: number[] = [];
  const originalZ: number[] = [];
  const flexWeights: number[] = [];

  for (let i = 0; i < frontPos.count; i++) {
    const x = frontPos.getX(i);
    const y = frontPos.getY(i);
    const normY = (y + clothH * 0.5) / clothH;

    const chestDrape = Math.sin(normY * Math.PI) * 0.038;
    const lateralFall = Math.cos((x / (clothW * 0.5)) * (Math.PI * 0.5)) * 0.015;
    const zOffset = 0.035 + chestDrape + lateralFall;

    let adjustedY = y;
    if (normY > 0.82) {
      const shoulderSlope = (Math.abs(x) / (clothW * 0.5)) * -0.045;
      adjustedY += shoulderSlope;
    }

    frontPos.setZ(i, zOffset);
    frontPos.setY(i, adjustedY);

    originalX.push(x);
    originalY.push(adjustedY);
    originalZ.push(zOffset);

    const flex = Math.pow(1.0 - Math.min(1.0, normY * 1.08), 1.6);
    flexWeights.push(flex);
  }

  frontGeo.userData.originalX = originalX;
  frontGeo.userData.originalY = originalY;
  frontGeo.userData.originalZ = originalZ;
  frontGeo.userData.flexWeights = flexWeights;

  frontGeo.computeVertexNormals();
  const frontClothMesh = new THREE.Mesh(frontGeo, fabricFrontMat);
  frontClothMesh.position.set(0, -0.08, 0.02);
  frontClothMesh.castShadow = true;
  frontClothMesh.receiveShadow = true;
  proceduralGroup.add(frontClothMesh);

  const backGeo = new THREE.PlaneGeometry(clothW, clothH, segX, segY);
  const backPos = backGeo.attributes.position;

  // INCREASED GAP TO -0.16 TO PREVENT CLIPPING
  for (let i = 0; i < backPos.count; i++) {
    const x = frontPos.getX(i);
    const y = frontPos.getY(i);
    const normY = (y + clothH * 0.5) / clothH;
    const backDrape = -0.16 - Math.sin(normY * Math.PI) * 0.015;
    backPos.setXYZ(i, x, y, backDrape);
  }

  backGeo.computeVertexNormals();
  const backClothMesh = new THREE.Mesh(backGeo, fabricBackMat);
  backClothMesh.position.set(0, -0.08, 0.02);
  backClothMesh.castShadow = true;
  backClothMesh.receiveShadow = true;
  proceduralGroup.add(backClothMesh);

  const sideW = 0.36; 
  const sideGeo = new THREE.PlaneGeometry(sideW, clothH, 8, segY);

  const sideLeftMesh = new THREE.Mesh(sideGeo, fabricSideLeftMat);
  sideLeftMesh.position.set(-clothW * 0.35, -0.08, -0.01);
  sideLeftMesh.rotation.y = -Math.PI / 2;
  sideLeftMesh.castShadow = true;
  sideLeftMesh.receiveShadow = true;
  proceduralGroup.add(sideLeftMesh);

  const sideRightMesh = new THREE.Mesh(sideGeo.clone(), fabricSideRightMat);
  sideRightMesh.position.set(clothW * 0.35, -0.08, -0.01);
  sideRightMesh.rotation.y = Math.PI / 2;
  sideRightMesh.castShadow = true;
  sideRightMesh.receiveShadow = true;
  proceduralGroup.add(sideRightMesh);

  [-clothW * 0.32, clothW * 0.32].forEach((sx) => {
    const strapCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(sx, 0.44, 0.045),
      new THREE.Vector3(sx, 0.46, -0.015),
      new THREE.Vector3(sx, 0.43, -0.048)
    );
    const strapGeo = new THREE.TubeGeometry(strapCurve, 16, 0.026, 12, false);
    strapGeo.scale(1.4, 0.45, 1);
    const strapMesh = new THREE.Mesh(strapGeo, fabricFrontMat);
    strapMesh.castShadow = true;
    proceduralGroup.add(strapMesh);
  });

  const collarCurve = new THREE.EllipseCurve(0, 0.435, 0.125, 0.065, 0, Math.PI * 2, false, 0);
  const collarPoints = collarCurve.getPoints(32).map((p) => new THREE.Vector3(p.x, p.y, 0.038));
  const collarPath = new THREE.CatmullRomCurve3(collarPoints);
  const collarGeo = new THREE.TubeGeometry(collarPath, 32, 0.009, 10, true);
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.92,
    metalness: 0.02
  });
  const collarMesh = new THREE.Mesh(collarGeo, collarMat);
  collarMesh.castShadow = true;
  proceduralGroup.add(collarMesh);

  group.add(garmentGroup);

  // ALWAYS ATTEMPT TO LOAD THE GLB FILE
  const glbPath = product.modelUrl || '/models/garment.glb';
  loadCustomGarmentGlb(
    glbPath,
    garmentGroup,
    {
      position: { x: posX, y: posY, z: posZ },
      rotation: { x: rotX, y: rotY, z: rotZ },
      scale: { x: sclX, y: sclY, z: sclZ }
    }
  );

  group.userData.hanger = hangerGroup;
  group.userData.garmentGroup = garmentGroup;
  group.userData.proceduralGroup = proceduralGroup;
  group.userData.offsets = {
    position: { x: posX, y: posY, z: posZ },
    rotation: { x: rotX, y: rotY, z: rotZ },
    scale: { x: sclX, y: sclY, z: sclZ }
  };
  group.userData.frontCloth = frontClothMesh;
  group.userData.backCloth = backClothMesh;
  group.userData.sideLeft = sideLeftMesh;
  group.userData.sideRight = sideRightMesh;
  group.userData.originalX = originalX;
  group.userData.originalY = originalY;
  group.userData.originalZ = originalZ;
  group.userData.flexWeights = flexWeights;

  const hitGeo = new THREE.BoxGeometry(hangerBarLength * 1.15, 1.25, 0.38);
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  hitMesh.position.set(0, 0.05, 0);
  group.add(hitMesh);

  const baseScale = isDetailedPDP ? 1.45 : 1.08;
  group.scale.set(baseScale, baseScale, baseScale);

  return group;
}

export function applyGarmentOffsets(
  group: THREE.Group,
  offsets: GarmentTransformOffsets
): void {
  const garmentGroup = group.userData.garmentGroup as THREE.Group | undefined;
  if (!garmentGroup) return;

  garmentGroup.position.set(offsets.position.x, offsets.position.y, offsets.position.z);
  garmentGroup.rotation.set(offsets.rotation.x, offsets.rotation.y, offsets.rotation.z);
  garmentGroup.scale.set(offsets.scale.x, offsets.scale.y, offsets.scale.z);

  group.userData.offsets = {
    position: { ...offsets.position },
    rotation: { ...offsets.rotation },
    scale: { ...offsets.scale }
  };
}

export function loadCustomGarmentGlb(
  url: string,
  targetGarmentGroup: THREE.Group,
  offsets: GarmentTransformOffsets,
  onLoaded?: (glbScene: THREE.Group) => void,
  onError?: (err: unknown) => void
): void {
  gltfLoader.load(
    url,
    (gltf) => {
      const glbScene = gltf.scene;
      glbScene.name = 'custom-glb-garment-model';

      glbScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.roughness !== undefined) {
              mat.roughness = Math.max(mat.roughness, 0.75); 
            }
          }
        }
      });

      // Compute bounding box and normalize centimeter models (e.g. 99.94cm tall from Tripo AI) to meters
      const bbox = new THREE.Box3().setFromObject(glbScene);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const unitScale = size.y > 5.0 ? 0.01 : 1.0;

      glbScene.scale.set(unitScale, unitScale, unitScale);
      glbScene.position.set(0, 0, 0);
      glbScene.rotation.set(0, 0, 0);

      const existing = targetGarmentGroup.getObjectByName('custom-glb-garment-model');
      if (existing) {
        targetGarmentGroup.remove(existing);
      }

      targetGarmentGroup.add(glbScene);
      targetGarmentGroup.userData.glbModel = glbScene;

      // Ensure garment group has the exact user offsets
      targetGarmentGroup.position.set(offsets.position.x, offsets.position.y, offsets.position.z);
      targetGarmentGroup.rotation.set(offsets.rotation.x, offsets.rotation.y, offsets.rotation.z);
      targetGarmentGroup.scale.set(offsets.scale.x, offsets.scale.y, offsets.scale.z);

      const procedural = targetGarmentGroup.getObjectByName('procedural-panels');
      if (procedural) {
        procedural.visible = false;
      }

      if (onLoaded) onLoaded(glbScene);
    },
    undefined,
    (err) => {
      const procedural = targetGarmentGroup.getObjectByName('procedural-panels');
      if (procedural) {
        procedural.visible = true;
      }
      if (onError) onError(err);
    }
  );
}

export const createCactusBearApparelMesh = createCrownOfThornsApparelMesh;

export function createClothingRail(): THREE.Group {
  const group = new THREE.Group();

  const barGeo = new THREE.CylinderGeometry(0.022, 0.022, 6.4, 32);
  barGeo.rotateZ(Math.PI / 2);
  const bar = new THREE.Mesh(barGeo, matteBlackIndustrialSteelRailMat);
  bar.position.set(0, 2.58, -4.3);
  bar.castShadow = true;
  bar.receiveShadow = true;
  bar.matrixAutoUpdate = false;
  bar.updateMatrix();
  group.add(bar);

  [-3.2, 3.2].forEach((x) => {
    const capGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.035, 24);
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, matteBlackIndustrialSteelRailMat);
    cap.position.set(x, 2.58, -4.3);
    cap.matrixAutoUpdate = false;
    cap.updateMatrix();
    group.add(cap);

    const silverRingGeo = new THREE.TorusGeometry(0.024, 0.0035, 12, 24);
    silverRingGeo.rotateY(Math.PI / 2);
    const silverRing = new THREE.Mesh(silverRingGeo, silverMetalHookMat);
    silverRing.position.set(x + (x > 0 ? -0.025 : 0.025), 2.58, -4.3);
    silverRing.matrixAutoUpdate = false;
    silverRing.updateMatrix();
    group.add(silverRing);
  });

  [-2.6, 0, 2.6].forEach((x) => {
    const pipeGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.62, 20);
    pipeGeo.rotateX(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeo, matteBlackIndustrialSteelRailMat);
    pipe.position.set(x, 2.58, -4.61);
    pipe.castShadow = true;
    pipe.matrixAutoUpdate = false;
    pipe.updateMatrix();
    group.add(pipe);

    const flangeGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.02, 24);
    flangeGeo.rotateX(Math.PI / 2);
    const flange = new THREE.Mesh(flangeGeo, matteBlackIndustrialSteelRailMat);
    flange.position.set(x, 2.58, -4.92);
    flange.matrixAutoUpdate = false;
    flange.updateMatrix();
    group.add(flange);

    const washerGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.025, 20);
    washerGeo.rotateX(Math.PI / 2);
    const washer = new THREE.Mesh(washerGeo, silverMetalHookMat);
    washer.position.set(x, 2.58, -4.89);
    washer.matrixAutoUpdate = false;
    washer.updateMatrix();
    group.add(washer);
  });

  group.matrixAutoUpdate = false;
  group.updateMatrix();
  return group;
}

export function createCrownOfThornsBrandLogo(): THREE.Group {
  const group = new THREE.Group();

  // Natural wide aspect ratio logo (1505 x 583 ~ 2.58:1)
  const logoWidth = 3.2;
  const logoHeight = 1.24;

  const logoGeo = new THREE.PlaneGeometry(logoWidth, logoHeight);
  const logoTex = textureLoader.load('/cactus-bear-transparent.png');
  logoTex.colorSpace = THREE.SRGBColorSpace;
  logoTex.generateMipmaps = true;
  logoTex.minFilter = THREE.LinearMipmapLinearFilter;

  // Crisp black streetwear brand insignia flat on the yellow studio wall behind the clothing rack
  const logoMat = new THREE.MeshBasicMaterial({
    map: logoTex,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });

  const logoMesh = new THREE.Mesh(logoGeo, logoMat);
  logoMesh.position.set(0, 3.25, -4.92);
  logoMesh.matrixAutoUpdate = false;
  logoMesh.updateMatrix();
  group.add(logoMesh);

  group.matrixAutoUpdate = false;
  group.updateMatrix();
  return group;
}

export const createCactusBearBrandLogo = createCrownOfThornsBrandLogo;

export function createShoeWallElements(): THREE.Group {
  const group = new THREE.Group();

  const panelGeo = new THREE.BoxGeometry(0.06, 2.9, 3.8);
  const panel = new THREE.Mesh(panelGeo, oakWoodMat);
  panel.position.set(4.42, 1.85, 0.0);
  panel.receiveShadow = true;
  panel.castShadow = true;
  panel.matrixAutoUpdate = false;
  panel.updateMatrix();
  group.add(panel);

  for (let z = -1.8; z <= 1.8; z += 0.25) {
    const grooveGeo = new THREE.BoxGeometry(0.015, 2.88, 0.012);
    const grooveMat = new THREE.MeshBasicMaterial({ color: 0xb08968 });
    const groove = new THREE.Mesh(grooveGeo, grooveMat);
    groove.position.set(4.385, 1.85, z);
    groove.matrixAutoUpdate = false;
    groove.updateMatrix();
    group.add(groove);
  }

  const shelfPositions: [number, number, number][] = [
    [4.25, 2.22, -1.3],
    [4.25, 2.22, 0.0],
    [4.25, 2.22, 1.3],
    [4.25, 1.42, -1.3],
    [4.25, 1.42, 0.0],
    [4.25, 1.42, 1.3],
  ];

  shelfPositions.forEach(([x, y, z]) => {
    const shelfGeo = new THREE.BoxGeometry(0.48, 0.035, 0.95);
    const shelf = new THREE.Mesh(shelfGeo, whiteShelfMat);
    shelf.position.set(x, y, z);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    shelf.matrixAutoUpdate = false;
    shelf.updateMatrix();
    group.add(shelf);

    const ledGeo = new THREE.BoxGeometry(0.02, 0.008, 0.88);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(x - 0.15, y - 0.02, z);
    led.matrixAutoUpdate = false;
    led.updateMatrix();
    group.add(led);
  });

  const signBackingGeo = new THREE.BoxGeometry(0.03, 0.26, 0.85);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.3 });
  const signBacking = new THREE.Mesh(signBackingGeo, signMat);
  signBacking.position.set(4.38, 3.45, 0.0);
  signBacking.castShadow = true;
  signBacking.matrixAutoUpdate = false;
  signBacking.updateMatrix();
  group.add(signBacking);

  [-0.32, 0.32].forEach((zOffset) => {
    const wireGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.8, 8);
    const wire = new THREE.Mesh(wireGeo, satinChromeMat);
    wire.position.set(4.38, 3.85, zOffset);
    wire.matrixAutoUpdate = false;
    wire.updateMatrix();
    group.add(wire);
  });

  const frameGeo = new THREE.BoxGeometry(0.04, 1.7, 1.3);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(4.42, 2.0, 2.7);
  frame.castShadow = true;
  frame.matrixAutoUpdate = false;
  frame.updateMatrix();
  group.add(frame);

  const canvasGeo = new THREE.PlaneGeometry(1.22, 1.62);
  canvasGeo.rotateY(-Math.PI / 2);
  let canvasMat: THREE.Material;
  try {
    const texArt = textureLoader.load('/products/garment-3.png');
    texArt.colorSpace = THREE.SRGBColorSpace;
    canvasMat = new THREE.MeshStandardMaterial({ map: texArt, roughness: 0.4 });
  } catch {
    canvasMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  }
  const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
  canvasMesh.position.set(4.39, 2.0, 2.7);
  canvasMesh.matrixAutoUpdate = false;
  canvasMesh.updateMatrix();
  group.add(canvasMesh);

  group.matrixAutoUpdate = false;
  group.updateMatrix();
  return group;
}

export function createCapWallElements(): THREE.Group {
  const group = new THREE.Group();

  const panelGeo = new THREE.BoxGeometry(0.06, 2.9, 3.4);
  const panel = new THREE.Mesh(panelGeo, oakWoodMat);
  panel.position.set(-4.42, 1.85, -0.3);
  panel.receiveShadow = true;
  panel.castShadow = true;
  panel.matrixAutoUpdate = false;
  panel.updateMatrix();
  group.add(panel);

  const signBackingGeo = new THREE.BoxGeometry(0.03, 0.26, 0.7);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.3 });
  const signBacking = new THREE.Mesh(signBackingGeo, signMat);
  signBacking.position.set(-4.38, 3.45, -0.3);
  signBacking.castShadow = true;
  signBacking.matrixAutoUpdate = false;
  signBacking.updateMatrix();
  group.add(signBacking);

  [-0.24, 0.24].forEach((zOffset) => {
    const wireGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.8, 8);
    const wire = new THREE.Mesh(wireGeo, satinChromeMat);
    wire.position.set(-4.38, 3.85, -0.3 + zOffset);
    wire.matrixAutoUpdate = false;
    wire.updateMatrix();
    group.add(wire);
  });

  const mirrorFrameGeo = new THREE.BoxGeometry(0.05, 2.2, 1.1);
  const mirrorFrame = new THREE.Mesh(mirrorFrameGeo, champagneBrassMat);
  mirrorFrame.position.set(-4.42, 1.8, 2.3);
  mirrorFrame.castShadow = true;
  mirrorFrame.matrixAutoUpdate = false;
  mirrorFrame.updateMatrix();
  group.add(mirrorFrame);

  const mirrorGlassGeo = new THREE.PlaneGeometry(1.0, 2.1);
  mirrorGlassGeo.rotateY(Math.PI / 2);
  const mirrorGlassMat = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.05,
    metalness: 0.95
  });
  const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, mirrorGlassMat);
  mirrorGlass.position.set(-4.39, 1.8, 2.3);
  mirrorGlass.matrixAutoUpdate = false;
  mirrorGlass.updateMatrix();
  group.add(mirrorGlass);

  group.matrixAutoUpdate = false;
  group.updateMatrix();
  return group;
}

export function createShowroomArchitecturalElements(): THREE.Group {
  const group = new THREE.Group();

  const plinthGeo = new THREE.BoxGeometry(2.4, 0.38, 1.2);
  const plinth = new THREE.Mesh(plinthGeo, travertineMat);
  plinth.position.set(0, 0.19, 0.8);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  plinth.matrixAutoUpdate = false;
  plinth.updateMatrix();
  group.add(plinth);

  const plinthBaseGeo = new THREE.BoxGeometry(2.32, 0.06, 1.12);
  const plinthBase = new THREE.Mesh(plinthBaseGeo, champagneBrassMat);
  plinthBase.position.set(0, 0.03, 0.8);
  plinthBase.matrixAutoUpdate = false;
  plinthBase.updateMatrix();
  group.add(plinthBase);

  const glassGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 0.05
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 0.56, 0.8);
  glass.matrixAutoUpdate = false;
  glass.updateMatrix();
  group.add(glass);

  const flaconGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16);
  const flacon = new THREE.Mesh(flaconGeo, darkGunmetalMat);
  flacon.position.set(0, 0.48, 0.8);
  flacon.matrixAutoUpdate = false;
  flacon.updateMatrix();
  group.add(flacon);

  const planterGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.65, 20);
  const planterMat = new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.6 });
  const planter = new THREE.Mesh(planterGeo, planterMat);
  planter.position.set(-3.2, 0.32, 1.8);
  planter.castShadow = true;
  planter.matrixAutoUpdate = false;
  planter.updateMatrix();
  group.add(planter);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const stemGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.1, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d4a22, roughness: 0.5 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(-3.2 + Math.cos(angle) * 0.08, 0.95, 1.8 + Math.sin(angle) * 0.08);
    stem.rotation.z = Math.cos(angle) * 0.15;
    stem.rotation.x = Math.sin(angle) * 0.15;
    stem.matrixAutoUpdate = false;
    stem.updateMatrix();
    group.add(stem);
  }

  [-1.6, 1.6].forEach((x) => {
    const trackGeo = new THREE.BoxGeometry(0.08, 0.04, 8.4);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(x, 4.58, 0.0);
    track.matrixAutoUpdate = false;
    track.updateMatrix();
    group.add(track);

    [-3.2, -1.6, 0.0, 1.6, 3.2].forEach((z) => {
      const spotHeadGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.12, 16);
      const spotHead = new THREE.Mesh(spotHeadGeo, trackMat);
      spotHead.position.set(x, 4.52, z);
      spotHead.rotation.x = z < 0 ? -0.3 : 0.3;
      spotHead.matrixAutoUpdate = false;
      spotHead.updateMatrix();
      group.add(spotHead);
    });
  });

  const nicheBackGeo = new THREE.PlaneGeometry(8.2, 2.6);
  const nicheBackMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18
  });
  const nicheBack = new THREE.Mesh(nicheBackGeo, nicheBackMat);
  nicheBack.position.set(0, 2.5, -4.92);
  nicheBack.matrixAutoUpdate = false;
  nicheBack.updateMatrix();
  group.add(nicheBack);

  group.matrixAutoUpdate = false;
  group.updateMatrix();
  return group;
}

export interface ClothPhysicsParams {
  time: number;
  delta: number;
  phaseOffset?: number;
  windStrength?: number; 
  hoverFactor?: number;  
  velZ?: number;         
  velRotY?: number;      
  centrifugal?: number;  
  impulseX?: number;     
  impulseZ?: number;     
  isGrabbed?: boolean;
  dragDeltaX?: number;   
  dragDeltaZ?: number;   
  dragVelocityX?: number;
  dragVelocityZ?: number;
}

export function updateGarmentClothPhysics(
  group: THREE.Group,
  params: ClothPhysicsParams
): void {
  const frontCloth = group.userData.frontCloth as THREE.Mesh | undefined;
  const backCloth = group.userData.backCloth as THREE.Mesh | undefined;
  if (!frontCloth || group.getObjectByName('procedural-panels')?.visible === false) return;

  const geo = frontCloth.geometry;
  const pos = geo.attributes.position;
  const originalX = geo.userData.originalX || group.userData.originalX;
  const originalY = geo.userData.originalY || group.userData.originalY;
  const originalZ = geo.userData.originalZ || group.userData.originalZ;
  const flexWeights = geo.userData.flexWeights || group.userData.flexWeights;
  if (!originalZ || !flexWeights || !originalX || !originalY) return;

  const time = params.time;
  const phase = params.phaseOffset ?? 0;
  const wind = params.windStrength ?? 1.0;
  const hover = params.hoverFactor ?? 0.0;
  const velZ = params.velZ ?? 0.0;
  const velRotY = params.velRotY ?? 0.0;
  const centrifugal = params.centrifugal ?? 0.0;
  const impX = params.impulseX ?? 0.0;
  const impZ = params.impulseZ ?? 0.0;
  const isGrabbed = params.isGrabbed ?? false;
  const dragX = params.dragDeltaX ?? 0.0;
  const dragZ = params.dragDeltaZ ?? 0.0;
  const dragVelX = params.dragVelocityX ?? 0.0;
  const dragVelZ = params.dragVelocityZ ?? 0.0;

  const count = pos.count;
  for (let i = 0; i < count; i++) {
    const ox = originalX[i];
    const oy = originalY[i];
    const oz = originalZ[i];
    const w = flexWeights[i];
    if (w <= 0.001) continue;

    const wave1 = Math.sin(time * 3.4 - oy * 4.6 + phase + ox * 2.2) * 0.024 * wind;
    const wave2 = Math.cos(time * 5.2 - oy * 7.8 + phase * 1.3) * 0.012 * wind;
    const rippleX = Math.sin(time * 2.2 + ox * 4.5 + phase) * 0.014 * wind;
    const flutterZ = (wave1 + wave2 + rippleX) * w;

    const dragZVal = (-velZ * 0.22 + hover * 0.038 * Math.sin(time * 2.8 + phase)) * w;

    const twistX = (-velRotY * 0.18 + Math.sin(time * 3.1 + phase) * 0.008) * w;

    const flareZ = centrifugal * (0.045 + Math.abs(ox) * 0.03) * w;

    const touchDistortionZ = isGrabbed
      ? (dragZ * 0.65 + dragVelZ * 0.08) * Math.pow(w, 1.2)
      : (impZ * 0.05) * w;

    const touchDistortionX = isGrabbed
      ? (dragX * 0.55 + dragVelX * 0.06) * Math.pow(w, 1.2)
      : (impX * 0.04) * w;

    const newZ = oz + flutterZ + dragZVal + flareZ + touchDistortionZ;
    const newX = ox + twistX + touchDistortionX;

    pos.setZ(i, newZ);
    pos.setX(i, newX);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();

  if (backCloth && backCloth.geometry) {
    const backPos = backCloth.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      backPos.setX(i, pos.getX(i));
      backPos.setY(i, pos.getY(i));
      // MATCH THE -0.16 GAP TO PREVENT CLIPPING
      backPos.setZ(i, pos.getZ(i) - 0.16);
    }
    backPos.needsUpdate = true;
    backCloth.geometry.computeVertexNormals();
  }
}