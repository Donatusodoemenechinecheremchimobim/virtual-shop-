import { Product, CameraPreset, DepartmentId } from '../types/store';

export const PRODUCTS: Product[] = [
  {
    id: 'crown-of-thorns-christian-dopeclub-tank-white',
    name: 'Cactus Bear "Christian Dopeclub" Graphic Tank',
    subtitle: 'White Crewneck Sleeveless · Red Script Detail',
    department: 'clothing',
    price: 65,
    originalPrice: 75,
    imageUrl: '/products/angle-45-three-quarter.png',
    cutoutUrl: '/products/angle-45-three-quarter.png',
    angleImages: {
      threeQuarter: '/products/angle-45-three-quarter.png',
      sideLeft: '/products/angle-side-left.png',
      sideRight: '/products/angle-side-right.png',
      back: '/products/angle-back.png',
      front: '/products/angle-front.png'
    },
    description: 'A signature statement piece from Cactus Bear. This relaxed-cut crewneck tank top features the iconic distressed stencil "CHRISTIAN DOPECLUB" typography paired with an elegant red cursive "Kush Lifestyle" script from the Crown of Thorns series. Faithfully constructed in interactive 3D across all 5 authentic angles: 45° three-quarter perspective, side profile with open armhole depth, opposite profile, front, and back.',
    features: [
      'Exact distressed stencil "CHRISTIAN DOPECLUB" front graphic',
      'Fluid crimson red cursive "Kush Lifestyle" script accent',
      'Natural crewneck sleeveless cut with visible armhole depth',
      'Contoured matte-black wooden hanger with polished silver neck hook',
      'All 5 authentic 3D angles viewable (3/4, side profiles, front, back)'
    ],
    materials: '100% Premium Heavyweight Cotton Jersey (260 GSM).',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colorways: [
      { name: 'Pure White / Black & Red', hex: '#ffffff', secondaryHex: '#18181b', accentHex: '#dc2626' }
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
    sku: 'COT-CD-001W'
  },
  {
    id: 'cactus-bear-stoner-girl-tee',
    name: 'Cactus Bear "Stoner Girl" Graphic Tee',
    subtitle: 'Washed Charcoal Cotton · Stoner Girl 3D Series',
    department: 'clothing',
    price: 75,
    originalPrice: 90,
    imageUrl: '/products/stoner-girl-three-quarter.png',
    cutoutUrl: '/products/stoner-girl-three-quarter.png',
    angleImages: {
      threeQuarter: '/products/stoner-girl-three-quarter.png',
      sideLeft: '/products/stoner-girl-side-left.png',
      sideRight: '/products/stoner-girl-side-right.png',
      back: '/products/stoner-girl-back.png',
      front: '/products/stoner-girl-front.png'
    },
    description: 'An iconic streetwear silhouette from Cactus Bear featuring the signature "Stoner Girl" 3D character graphic motif. Cut in a relaxed boxy streetwear profile with natural drop shoulders and textured cotton drape. Fully modeled in photorealistic 3D across all genuine viewing perspectives, interactively inspectable and rotatable.',
    features: [
      'Original "Stoner Girl" character artwork and streetwear iconography',
      'Articulated 3D mesh with drop shoulders and genuine garment drape',
      'Contoured matte-black hanger presentation on the showroom rail',
      'All 5 authentic angles viewable (45° 3/4, side profiles, front, back)',
      'Full 360° rotation, interactive inspection, and physics sway'
    ],
    materials: '100% Combed Heavyweight Vintage Cotton (270 GSM).',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colorways: [
      { name: 'Washed Charcoal / Multi', hex: '#262626', secondaryHex: '#171717', accentHex: '#facc15' }
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
    id: 'cactus-bear-vintage-graphic-tshirt-black',
    name: 'Cactus Bear Vintage Graphic Tee',
    subtitle: 'Washed Black Heavyweight Cotton · Crown of Thorns Series',
    department: 'clothing',
    price: 70,
    originalPrice: 85,
    imageUrl: '/products/tshirt-front.png',
    cutoutUrl: '/products/tshirt-front.png',
    angleImages: {
      threeQuarter: '/products/tshirt-three-quarter.png',
      sideLeft: '/products/tshirt-side-left.png',
      sideRight: '/products/tshirt-side-right.png',
      back: '/products/tshirt-back.png',
      front: '/products/tshirt-front.png'
    },
    description: 'An iconic heavyweight graphic t-shirt engineered from premium vintage-washed cotton jersey. Featuring the distressed Crown of Thorns iconography across the chest with natural drop shoulders, tailored sleeve contours, and ribbed crewneck collar. Rendered with full 3D physics on a contoured matte-black wooden hanger.',
    features: [
      'Original Cactus Bear Crown of Thorns front graphic emblem',
      'Solid 3D textured mesh with authentic sleeve silhouette and crewneck',
      'Natural drop-shoulder drape resting flush on contoured matte-black hanger',
      'All genuine perspective angles: 45° three-quarter, side profiles, front, and back',
      'Interactive 3D rotation, cloth physics, and alignment controls'
    ],
    materials: '100% Combed Heavyweight Vintage Cotton (280 GSM).',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colorways: [
      { name: 'Vintage Washed Black', hex: '#1c1b1f', secondaryHex: '#2b292e', accentHex: '#d4af37' }
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
    sku: 'COT-VT-002B'
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
