import type {
  ProductListResponse,
  ProductDetailResponse,
  Category,
  Filters,
  BlogPost,
  BlogListItem,
  SearchResult,
  CatalogSearchParams,
} from '@/types';

const API_URL = typeof window === 'undefined'
  ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ─── Helper fetch ──────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    next: { revalidate: 60 }, // ISR: revalidar cada 60s
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  return response.json();
}

// ─── Productos ────────────────────────────────────────────────────────────────
export async function getProducts(
  params: CatalogSearchParams = {},
): Promise<ProductListResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      qs.set(key, String(value));
    }
  });
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<ProductListResponse>(`/products${query}`, { next: { revalidate: 30 } });
}

export async function getFeaturedProducts(): Promise<{ data: ProductDetailResponse['data'][] }> {
  return apiFetch(`/products/featured`);
}

export async function getProduct(slug: string): Promise<ProductDetailResponse> {
  return apiFetch<ProductDetailResponse>(`/products/${slug}`, {
    next: { revalidate: 60 },
  });
}

// ─── Categorías ───────────────────────────────────────────────────────────────
export async function getCategories(): Promise<{ data: Category[] }> {
  return apiFetch<{ data: Category[] }>('/categories', {
    next: { revalidate: 300 }, // Categorías cambian poco
  });
}

export async function getCategory(slug: string): Promise<{ data: Category }> {
  return apiFetch<{ data: Category }>(`/categories/${slug}`, {
    next: { revalidate: 300 },
  });
}

// ─── Filtros ──────────────────────────────────────────────────────────────────
export async function getFilters(category?: string): Promise<Filters> {
  const query = category ? `?category=${category}` : '';
  return apiFetch<Filters>(`/filters${query}`, { next: { revalidate: 120 } });
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export async function getBlogPosts(params: { page?: number; limit?: number } = {}): Promise<{
  data: BlogListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch(`/blog${query}`, { next: { revalidate: 300 } });
}

export async function getBlogPost(slug: string): Promise<{ data: BlogPost; related: BlogListItem[] }> {
  return apiFetch(`/blog/${slug}`, { next: { revalidate: 300 } });
}

// ─── Búsqueda ─────────────────────────────────────────────────────────────────
export async function searchProducts(q: string, limit = 8): Promise<SearchResult> {
  return apiFetch<SearchResult>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
    cache: 'no-store', // Búsqueda siempre fresca
  });
}
