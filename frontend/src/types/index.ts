// ─── Marcas ──────────────────────────────────────────────────────────────────
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
}

// ─── Categorías ──────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  parentId?: number | null;
  parent?: Category | null;
  children?: Category[];
  _count?: { products: number };
}

// ─── Imágenes de producto ────────────────────────────────────────────────────
export interface ProductImage {
  id: number;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

// ─── Producto ─────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  shortDesc?: string | null;
  price: string | number;
  comparePrice?: string | number | null;
  stock: number;
  sku?: string | null;
  brand: Brand;
  brandId: number;
  category: Category;
  categoryId: number;
  // Dimensiones
  weightKg?: string | number | null;
  heightCm?: string | number | null;
  widthCm?: string | number | null;
  depthCm?: string | number | null;
  // Eficiencia
  energyRating?: string | null;
  // Capacidades
  capacityLiters?: string | number | null;
  capacityKg?: string | number | null;
  noiseDb?: number | null;
  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  // Estado
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
}

// ─── Paginación ───────────────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Respuesta de listado de productos ───────────────────────────────────────
export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
}

// ─── Respuesta de producto único ─────────────────────────────────────────────
export interface ProductDetailResponse {
  data: Product;
  related: Product[];
}

// ─── Filtros ─────────────────────────────────────────────────────────────────
export interface Filters {
  price: { min: number; max: number };
  brands: { id: number; name: string; slug: string }[];
  energyRatings: { value: string; count: number }[];
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface BlogListItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
}

// ─── Parámetros de búsqueda del catálogo ─────────────────────────────────────
export interface CatalogSearchParams {
  page?: string;
  limit?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  energy?: string;
  sort?: string;
  q?: string;
}

// ─── Resultado de búsqueda rápida ────────────────────────────────────────────
export interface SearchResult {
  products: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'brand' | 'images'>[];
  categories: Pick<Category, 'id' | 'name' | 'slug' | 'parentId'>[];
}
