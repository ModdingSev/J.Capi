import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Zap, Package, Ruler, Volume2, Check } from 'lucide-react';
import { getProduct } from '@/lib/api';
import ProductCard from '@/components/catalog/ProductCard';
import ProductImage from '@/components/catalog/ProductImage';
import Breadcrumb from '@/components/catalog/Breadcrumb';
import ReserveButton from '@/components/catalog/ReserveButton';
import { formatPrice, getDiscountPercent, getEnergyColor, getPrimaryImage } from '@/lib/utils';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { data: product } = await getProduct(params.slug);
    const title = product.metaTitle ?? `${product.name} | J. Capi`;
    const description =
      product.metaDescription ??
      `Compra ${product.name} en J. Capi. ${product.shortDesc ?? ''} Envío rápido y garantía oficial.`.trim();
    const imageUrl = getPrimaryImage(product.images);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl, alt: product.name }],
        type: 'website',
      },
      alternates: {
        canonical: `/productos/${product.slug}`,
      },
    };
  } catch {
    return { title: 'Producto no encontrado' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product, related;

  try {
    const res = await getProduct(params.slug);
    product = res.data;
    related = res.related;
  } catch {
    notFound();
  }

  const imageUrl = getPrimaryImage(product.images);
  const discount = getDiscountPercent(product.price, product.comparePrice);
  const energyColor = getEnergyColor(product.energyRating);

  // Construir breadcrumb
  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: 'Catálogo', href: '/catalogo' },
  ];
  if (product.category.parent) {
    breadcrumbItems.push({
      label: product.category.parent.name,
      href: `/catalogo?category=${product.category.parent.slug}`,
    });
  }
  breadcrumbItems.push({
    label: product.category.name,
    href: `/catalogo?category=${product.category.slug}`,
  });
  breadcrumbItems.push({ label: product.name });

  // JSON-LD Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.shortDesc,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand.name,
    },
    offers: {
      '@type': 'Offer',
      price: Number(product.price).toFixed(2),
      priceCurrency: 'EUR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jcapi.es'}/productos/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'J. Capi',
      },
    },
    image: product.images.map((img) => img.url),
    ...(product.energyRating && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Clase energética',
        value: product.energyRating,
      },
    }),
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-site py-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* ── Contenido principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
          {/* ── Imágenes ── */}
          <div className="space-y-3">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100">
              {discount && (
                <span className="badge-sale text-base px-3 py-1.5">-{discount}%</span>
              )}
              <ProductImage
                src={imageUrl}
                alt={product.images[0]?.alt ?? product.name}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8"
                priority
              />
            </div>
            {/* Miniaturas */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <div
                    key={img.id}
                    className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden 
                               border-2 border-gray-100 hover:border-red-300 cursor-pointer 
                               transition-colors"
                  >
                    <ProductImage
                      src={img.url}
                      alt={img.alt ?? `${product.name} imagen ${i + 1}`}
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info del producto ── */}
          <div className="space-y-5">
            {/* Marca */}
            <Link
              href={`/catalogo?brand=${product.brand.slug}`}
              className="inline-block text-sm font-semibold text-[#CC0000] hover:underline uppercase tracking-wide"
            >
              {product.brand.name}
            </Link>

            {/* H1 */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Descripción corta */}
            {product.shortDesc && (
              <p className="text-gray-500 text-sm leading-relaxed">{product.shortDesc}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.energyRating && (
                <span
                  className="energy-badge text-white px-3 py-1 text-sm"
                  style={{ backgroundColor: energyColor }}
                >
                  <Zap className="w-3.5 h-3.5 inline-block mr-1" />
                  Clase {product.energyRating}
                </span>
              )}
              {product.isNew && (
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Nuevo
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Destacado
                </span>
              )}
            </div>

            {/* Precio */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-[#CC0000]">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
                {discount && (
                  <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    Ahorra {discount}%
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">IVA incluido • Envío gratuito &gt; 300€</p>
            </div>

            {/* Características rápidas */}
            <div className="grid grid-cols-2 gap-3">
              {product.capacityKg && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">
                  <Package className="w-4 h-4 text-[#CC0000] flex-shrink-0" />
                  <span>Capacidad: <strong>{Number(product.capacityKg)}kg</strong></span>
                </div>
              )}
              {product.noiseDb && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">
                  <Volume2 className="w-4 h-4 text-[#CC0000] flex-shrink-0" />
                  <span>Ruido: <strong>{product.noiseDb}dB</strong></span>
                </div>
              )}
              {(product.heightCm && product.widthCm && product.depthCm) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100 col-span-2">
                  <Ruler className="w-4 h-4 text-[#CC0000] flex-shrink-0" />
                  <span>
                    {Number(product.heightCm)}×{Number(product.widthCm)}×{Number(product.depthCm)}cm
                  </span>
                </div>
              )}
            </div>

            {/* Garantías */}
            <div className="space-y-2">
              {['Garantía oficial 2 años', 'Envío en 24-48h', 'Devolución en 30 días'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Botones */}
            <ReserveButton 
              product={{
                id: product.id,
                name: product.name,
                price: Number(product.price),
                imageUrl: imageUrl
              }} 
            />

            {/* Estado del stock */}
            {product.stock <= 3 && product.stock > 0 && (
              <p className="text-sm text-orange-600 font-medium">
                ¡Solo quedan {product.stock} en tienda!
              </p>
            )}
            {product.stock === 0 && (
              <p className="text-sm text-orange-600 font-medium">Bajo pedido (Sin stock actual, pero puedes reservarlo)</p>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-gray-400">Ref: {product.sku}</p>
            )}
          </div>
        </div>

        {/* ── Descripción completa ── */}
        {product.description && (
          <section className="mt-12" aria-labelledby="desc-heading">
            <h2 id="desc-heading" className="text-xl font-bold text-gray-900 mb-4">
              Descripción del producto
            </h2>
            <div className="bg-white rounded-xl p-6 border border-gray-100 prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </section>
        )}

        {/* ── Especificaciones técnicas ── */}
        <section className="mt-8" aria-labelledby="specs-heading">
          <h2 id="specs-heading" className="text-xl font-bold text-gray-900 mb-4">
            Especificaciones técnicas
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: 'Marca', value: product.brand.name },
                  { label: 'Modelo', value: product.sku },
                  { label: 'Clase energética', value: product.energyRating },
                  { label: 'Capacidad (kg)', value: product.capacityKg ? `${Number(product.capacityKg)} kg` : null },
                  { label: 'Nivel de ruido', value: product.noiseDb ? `${product.noiseDb} dB` : null },
                  { label: 'Peso', value: product.weightKg ? `${Number(product.weightKg)} kg` : null },
                  {
                    label: 'Dimensiones (Al×An×Pr)',
                    value: product.heightCm && product.widthCm && product.depthCm
                      ? `${Number(product.heightCm)} × ${Number(product.widthCm)} × ${Number(product.depthCm)} cm`
                      : null,
                  },
                ]
                  .filter((row) => row.value)
                  .map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-5 py-3 font-medium text-gray-600 w-48">{row.label}</td>
                      <td className="px-5 py-3 text-gray-900">{row.value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Productos relacionados ── */}
        {related && related.length > 0 && (
          <section className="mt-12" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-6">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
