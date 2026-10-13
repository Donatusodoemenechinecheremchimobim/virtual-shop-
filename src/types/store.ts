export type DepartmentId = 'all' | 'clothing' | 'shoes' | 'caps';

export interface Colorway {
  name: string;
  hex: string;
  secondaryHex?: string;
  accentHex?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  department: 'clothing' | 'shoes' | 'caps';
  price: number;
  originalPrice?: number;
  imageUrl: string;
  cutoutUrl: string;
  angleImages?: {
    threeQuarter: string;
    sideLeft: string;
    sideRight: string;
    back: string;
    front: string;
  };
  description: string;
  features: string[];
  materials: string;
  sizes: string[];
  colorways: Colorway[];
  defaultColorIndex: number;
  modelType: 'layered' | 'tank' | 'tee';
  modelUrl?: string; // Optional custom 3D garment .glb model URL
  garmentOffsets?: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  };
  // 3D coordinates in the showroom
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  sku: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  selectedColorIndex: number;
  quantity: number;
}

export interface CameraPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  department: DepartmentId;
}

