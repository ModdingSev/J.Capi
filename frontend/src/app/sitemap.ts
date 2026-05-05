import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/api';
import { getBlogPosts } from '@/lib/api';
import { getCategories } from '@/lib/api';

const BASE_URL = 'https://www.jcapi.es';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/catalogo`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/servicio-tecnico`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contacto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Categorías dinámicas
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const catData = await getCategories();
    const categories = catData.data ?? [];
    categoryRoutes = categories
      .filter((c) => !c.parentId) // sólo padres
      .map((c) => ({
        url: `${BASE_URL}/catalogo?categoria=${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch {
    // ignorar si la API no está disponible en build
  }

  // Productos dinámicos
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const productData = await getProducts({ limit: '500' });
    const products = productData.data ?? [];
    productRoutes = products.map((p) => ({
      url: `${BASE_URL}/productos/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));
  } catch {
    // ignorar si la API no está disponible en build
  }

  // Posts de blog dinámicos
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogData = await getBlogPosts({ limit: 100 });
    const posts = blogData.data ?? [];
    blogRoutes = posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }));
  } catch {
    // ignorar si la API no está disponible en build
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
