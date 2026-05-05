import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts, getFilters, getCategory } from '@/lib/api';
import ProductCard from '@/components/catalog/ProductCard';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import Pagination from '@/components/catalog/Pagination';
import Breadcrumb from '@/components/catalog/Breadcrumb';
import type { CatalogSearchParams } from '@/types';

interface CatalogPageProps {
  searchParams: CatalogSearchParams;
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  let title = 'Catálogo de Electrodomésticos';
  let description = 'Explora nuestro catálogo completo de electrodomésticos. Frigoríficos, lavadoras, lavavajillas, hornos y más en J. Capi.';

  if (searchParams.category) {
    try {
      const { data: cat } = await getCategory(searchParams.category);
      if (cat) {
        title = `${cat.name} — Catálogo`;
        description = `Compra ${cat.name.toLowerCase()} online en J. Capi. Los mejores precios y marcas. Envío rápido.`;
        if (cat.description) description = cat.description;
      }
    } catch {/* continúa con default */}
  }

  if (searchParams.q) {
    title = `Búsqueda: "${searchParams.q}"`;
    description = `Resultados de búsqueda para "${searchParams.q}" en J. Capi — Tu tienda de electrodomésticos.`;
  }

  return {
    title,
    description,
    robots: searchParams.q
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: {
      canonical: searchParams.category ? `/catalogo?category=${searchParams.category}` : '/catalogo',
    },
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Cargar datos en paralelo
  const [productsRes, filtersRes] = await Promise.allSettled([
    getProducts({
      page: searchParams.page ?? '1',
      limit: '12',
      category: searchParams.category,
      brand: searchParams.brand,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      energy: searchParams.energy,
      sort: searchParams.sort,
      q: searchParams.q,
    }),
    getFilters(searchParams.category),
  ]);

  const products =
    productsRes.status === 'fulfilled'
      ? productsRes.value
      : { data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };

  const filters =
    filtersRes.status === 'fulfilled'
      ? filtersRes.value
      : { price: { min: 0, max: 9999 }, brands: [], energyRatings: [] };

  // Obtener info de categoría para breadcrumb y título
  let categoryName: string | undefined;
  let parentCategoryName: string | undefined;
  let parentCategorySlug: string | undefined;

  if (searchParams.category) {
    try {
      const { data: cat } = await getCategory(searchParams.category);
      categoryName = cat.name;
      if (cat.parent) {
        parentCategoryName = cat.parent.name;
        parentCategorySlug = cat.parent.slug;
      }
    } catch {/* silencia */}
  }

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Catálogo', href: '/catalogo' },
    ...(parentCategoryName
      ? [{ label: parentCategoryName, href: `/catalogo?category=${parentCategorySlug}` }]
      : []),
    ...(categoryName
      ? [{ label: categoryName }]
      : []),
    ...(searchParams.q
      ? [{ label: `"${searchParams.q}"` }]
      : []),
  ];

  // H1 dinámico
  const heading = categoryName ?? (searchParams.q ? `Resultados para "${searchParams.q}"` : 'Catálogo de Electrodomésticos');

  // Builder de URL para paginación
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.brand) params.set('brand', searchParams.brand);
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
    if (searchParams.energy) params.set('energy', searchParams.energy);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    if (searchParams.q) params.set('q', searchParams.q);
    params.set('page', String(p));
    return `/catalogo?${params.toString()}`;
  };

  return (
    <div className="flex gap-0 min-h-[calc(100vh-7.5rem)] w-full">

      {/* Sidebar de filtros — lateral izquierdo, pegado al borde de pantalla */}
      <FilterSidebar
        filters={filters}
        currentParams={{
          brand: searchParams.brand ?? '',
          minPrice: searchParams.minPrice ?? '',
          maxPrice: searchParams.maxPrice ?? '',
          energy: searchParams.energy ?? '',
          sort: searchParams.sort ?? 'newest',
        }}
      />

        {/* Contenido principal — margen izquierdo igual al ancho del sidebar */}
        <div className="flex-1 min-w-0 py-6 px-5">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* H1 único */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{heading}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {products.pagination.total > 0
                ? `${products.pagination.total} productos encontrados`
                : 'No se encontraron productos con los filtros seleccionados'}
            </p>
          </div>

          {products.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Sin resultados
              </h2>
              <p className="text-gray-500 max-w-md">
                No hemos encontrado productos con esos criterios. Prueba a cambiar los filtros o la búsqueda.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginación */}
              <Pagination
                pagination={products.pagination}
                buildUrl={buildPageUrl}
              />
            </>
          )}
        </div>
      </div>
  );
}
