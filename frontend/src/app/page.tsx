import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, Wrench, Star } from 'lucide-react';
import { getFeaturedProducts } from '@/lib/api';
import ProductCard from '@/components/catalog/ProductCard';
import { CATALOG_CATEGORIES } from '@/lib/categories';
import { APPLIANCE_ICON_MAP } from '@/components/icons/ApplianceIcons';

export const metadata: Metadata = {
  title: 'J. Capi — Tienda de Electrodomésticos',
  description:
    'J. Capi — Tu tienda de electrodomésticos de confianza. Frigoríficos, lavadoras, lavavajillas, hornos y más. Servicio técnico propio y envío rápido.',
  alternates: {
    canonical: '/',
  },
};

// Hero features
const FEATURES = [
  {
    icon: Truck,
    title: 'Envío rápido',
    desc: 'Entrega en 24-48h en península',
  },
  {
    icon: Wrench,
    title: 'Servicio técnico',
    desc: 'Propio y homologado por fabricantes',
  },
  {
    icon: Shield,
    title: 'Garantía oficial',
    desc: '2 años de garantía en todos los productos',
  },
  {
    icon: Star,
    title: 'Mejor precio',
    desc: 'Igualamos cualquier precio de la competencia',
  },
];

export default async function HomePage() {
  // Carga datos en el servidor (SSR)
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>>['data'] = [];
  try {
    const res = await getFeaturedProducts();
    featuredProducts = res.data;
  } catch {
    // Si el backend no está disponible, continúa con array vacío
  }

  return (
    <>
      {/* ─── JSON-LD WebSite ────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'J. Capi',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://jcapi.es',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jcapi.es'}/catalogo?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-br from-[#CC0000] via-[#B00000] to-[#880000] text-white"
        aria-label="Sección principal"
      >
        <div className="container-site py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-red-200 text-sm font-semibold uppercase tracking-widest mb-3">
              Tu tienda de confianza
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Electrodomésticos<br />
              <span className="text-yellow-300">al mejor precio</span>
            </h1>
            <p className="text-red-100 text-lg md:text-xl mb-8 leading-relaxed">
              Más de 20 años ofreciendo las mejores marcas en electrodomésticos
              con servicio técnico propio y garantía oficial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalogo" className="btn-primary bg-white text-[#CC0000] hover:bg-gray-100">
                Ver catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/servicio-tecnico" className="btn-secondary border-white text-white hover:bg-white hover:text-[#CC0000]">
                Servicio técnico
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100" aria-label="Ventajas J. Capi">
        <div className="container-site py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-[#CC0000]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORÍAS ───────────────────────────────────────────────────── */}
      <section className="container-site py-12" aria-labelledby="heading-categorias">
        <div className="flex items-center justify-between mb-6">
          <h2 id="heading-categorias" className="text-2xl font-bold text-gray-900">
            Nuestras categorías
          </h2>
          <Link href="/catalogo" className="text-sm text-[#CC0000] hover:underline font-medium flex items-center gap-1">
            Ver todo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATALOG_CATEGORIES.map((cat) => {
            const Icon = APPLIANCE_ICON_MAP[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={`/catalogo?category=${cat.slug}`}
                className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl
                           border border-gray-100 hover:border-red-200 hover:shadow-md
                           transition-all duration-200 text-center"
              >
                <div className="w-12 h-12 bg-red-50 group-hover:bg-red-100 rounded-full
                                flex items-center justify-center mb-3 transition-colors">
                  {Icon ? (
                    <Icon className="w-6 h-6 text-[#CC0000]" />
                  ) : (
                    <span className="text-2xl">🏠</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#CC0000] transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── PRODUCTOS DESTACADOS ─────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="container-site pb-12" aria-labelledby="heading-destacados">
          <div className="flex items-center justify-between mb-6">
            <h2 id="heading-destacados" className="text-2xl font-bold text-gray-900">
              Productos destacados
            </h2>
            <Link href="/catalogo" className="text-sm text-[#CC0000] hover:underline font-medium flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ─── BANNER SERVICIO TÉCNICO ───────────────────────────────────────── */}
      <section className="bg-gray-900 text-white" aria-label="Servicio técnico">
        <div className="container-site py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#CC0000] rounded-full flex items-center justify-center flex-shrink-0">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Servicio Técnico Oficial</h2>
                <p className="text-gray-400 mt-1">
                  Reparación de todas las marcas. Técnicos certificados y recambios originales.
                </p>
              </div>
            </div>
            <Link href="/servicio-tecnico" className="btn-primary flex-shrink-0">
              Solicitar servicio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}


