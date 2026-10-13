import { Product, CameraPreset, DepartmentId } from '../types/store';

export const PRODUCTS: Product[] = [
  {
    id: 'cactus-bear-stoner-advisory-tank-black',
    name: 'Cactus Bear "Stoner Advisory" Graphic Tank',
    subtitle: 'Washed Charcoal Sleeveless · Stoner Advisory Explicit Content',
    department: 'clothing',
    price: 55000,
    originalPrice: 65000,
    imageUrl: '/products/angle-45-three-quarter.png',
    cutoutUrl: '/products/angle-45-three-quarter.png',
    angleImages: {
      threeQuarter: '/products/angle-45-three-quarter.png',
      sideLeft: '/products/angle-side-left.png',
      sideRight: '/products/angle-side-right.png',
      back: '/products/angle-back.png',
      front: '/products/angle-front.png'
    },
    description: 'An iconic streetwear statement tank engineered from heavyweight vintage-washed cotton jersey. Features the bold distressed "STONER ADVISORY EXPLICIT CONTENT" front graphic emblem paired with the signature smoking bear insignia. Modeled in photorealistic 3D with authentic drape and armhole contouring.',
    features: [
      'Original "STONER ADVISORY EXPLICIT CONTENT" cartoon bear graphic',
      'Distressed washed charcoal cotton jersey with raw-edge aesthetic',
      'Natural relaxed sleeveless streetwear cut with visible armhole depth',
      'Accurate 3D physics rendering and multi-angle camera inspection',
      'Handcrafted in limited seasonal atelier drops in Nigeria and worldwide'
    ],
    materials: '100% Premium Heavyweight Cotton Jersey (260 GSM).',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colorways: [
      { name: 'Washed Charcoal Black', hex: '#1c1b1f', secondaryHex: '#2b292e', accentHex: '#facc15' }
    ],
    defaultColorIndex: 0,
    modelType: 'tank',
    modelUrl: '/models/garment.glb',
    position: [-0.80, 2.00, -4.3],
    rotation: [0, 1.5708, 0], // Sideways profile on hanger down the rail
    garmentOffsets: {
      position: { x: 0.00, y: -0.560, z: 0.00 },
      rotation: { x: 0.00, y: 0.00, z: 0.00 },
      scale: { x: 1.00, y: 1.00, z: 1.00 }
    },
    inStock: true,
    rating: 5.0,
    reviewCount: 312,
    sku: 'COT-SA-001B'
  },
  {
    id: 'cactus-bear-stoner-girl-tee',
    name: 'Cactus Bear "Stoner Girl" Graphic Tee',
    subtitle: 'Layered Graphic Long-Sleeve / Tee · Red Script Face Artwork',
    department: 'clothing',
    price: 65000,
    originalPrice: 75000,
    imageUrl: '/products/stoner-girl-three-quarter.png',
    cutoutUrl: '/products/stoner-girl-three-quarter.png',
    angleImages: {
      threeQuarter: '/products/stoner-girl-three-quarter.png',
      sideLeft: '/products/stoner-girl-side-left.png',
      sideRight: '/products/stoner-girl-side-right.png',
      back: '/products/stoner-girl-back.png',
      front: '/products/stoner-girl-front.png'
    },
    description: 'An iconic silhouette from Cactus Bear featuring the distinctive "Stoner Girl" graphic face artwork framed by white brushstrokes with wavy crimson red lettering. Crafted in a relaxed boxy streetwear profile with natural drop shoulders and textured vintage drape.',
    features: [
      'Original "Stoner Girl" face character artwork and streetwear motif',
      'Articulated 3D mesh with drop shoulders and genuine garment drape',
      'Contoured presentation on the showroom rail',
      'All 5 authentic angles viewable (45° 3/4, side profiles, front, back)',
      'Full 360° rotation, interactive inspection, and physics sway'
    ],
    materials: '100% Combed Heavyweight Vintage Cotton (270 GSM).',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colorways: [
      { name: 'Washed Charcoal / Multi', hex: '#262626', secondaryHex: '#171717', accentHex: '#dc2626' }
    ],
    defaultColorIndex: 0,
    modelType: 'tee',
    modelUrl: '/models/stoner-girl.glb',
    garmentOffsets: {
      position: { x: 0.00, y: -0.260, z: 0.00 },
      rotation: { x: 0.00, y: 0.00, z: 0.00 },
      scale: { x: 0.85, y: 0.90, z: 0.85 }
    },
    position: [0.00, 2.00, -4.3],
    rotation: [0, 1.5708, 0],
    inStock: true,
    rating: 5.0,
    reviewCount: 248,
    sku: 'COT-SG-003C'
  },
  {
    id: 'cactus-bear-christian-dopeclub-sleeveless-tee',
    name: 'Cactus Bear "Christian Dopeclub" Sleeveless Tee',
    subtitle: 'Pure White & Vintage Black · Kush Lifestyle Red Script',
    department: 'clothing',
    price: 60000,
    originalPrice: 70000,
    imageUrl: '/products/garment-christian-dopeclub-3quarter.png',
    cutoutUrl: '/products/garment-christian-dopeclub-3quarter.png',
    angleImages: {
      threeQuarter: '/products/garment-christian-dopeclub-3quarter.png',
      sideLeft: '/products/garment-christian-dopeclub-side.png',
      sideRight: '/products/garment-christian-dopeclub-alt.png',
      back: '/products/garment-christian-dopeclub-back.png',
      front: '/products/garment-christian-dopeclub-front.png'
    },
    description: 'A signature statement piece from Cactus Bear. This relaxed-cut crewneck sleeveless tee features the iconic distressed stencil "CHRISTIAN DOPECLUB" typography paired with fluid crimson red "Kush Lifestyle" script and the Crown of Thorns insignia.',
    features: [
      'Distressed stencil "CHRISTIAN DOPECLUB" front graphic',
      'Fluid crimson red cursive "Kush Lifestyle" script accent',
      'Natural crewneck sleeveless cut with visible armhole depth',
      'Authentic dual colorway availability (Pure White & Washed Black)',
      'All 5 authentic 3D perspective angles inspectable'
    ],
    materials: '100% Combed Heavyweight Vintage Cotton (280 GSM).',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colorways: [
      { name: 'Pure White / Black & Red', hex: '#ffffff', secondaryHex: '#18181b', accentHex: '#dc2626' },
      { name: 'Vintage Washed Black', hex: '#1c1b1f', secondaryHex: '#2b292e', accentHex: '#dc2626' }
    ],
    defaultColorIndex: 0,
    modelType: 'tee',
    modelUrl: '/models/t-shirt.glb',
    garmentOffsets: {
      position: { x: 0.00, y: -0.520, z: 0.00 },
      rotation: { x: 0.00, y: 0.00, z: 0.00 },
      scale: { x: 1.00, y: 1.00, z: 1.00 }
    },
    position: [0.80, 2.00, -4.3],
    rotation: [0, 1.5708, 0],
    inStock: true,
    rating: 4.9,
    reviewCount: 184,
    sku: 'COT-CD-002W'
  }
];

export const CAMERA_PRESETS: Record<DepartmentId, CameraPreset> = {
  all: {
    name: 'Overview 360°',
    position: [0.0, 2.2, 3.2],
    target: [0.0, 1.95, -1.8],
    department: 'all'
  },
  clothing: {
    name: 'Clothing',
    position: [0.0, 2.05, -1.6],
    target: [0.0, 2.05, -4.3],
    department: 'clothing'
  },
  shoes: {
    name: 'Shoes',
    position: [1.8, 1.85, 0.0],
    target: [4.25, 1.85, 0.0],
    department: 'shoes'
  },
  caps: {
    name: 'Caps',
    position: [-1.8, 1.9, -0.3],
    target: [-4.25, 1.9, -0.3],
    department: 'caps'
  }
};
