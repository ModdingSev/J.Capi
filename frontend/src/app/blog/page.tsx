import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { getBlogPosts } from '@/lib/api';
import Breadcrumb from '@/components/catalog/Breadcrumb';

export const metadata: Metadata = {
  title: 'Blog — Guías y Consejos de Electrodomésticos',
  description:
    'Artículos, guías de compra y consejos sobre electrodomésticos. Aprende a elegir el mejor electrodoméstico para tu hogar.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>>['data'] = [];
  try {
    const res = await getBlogPosts({ limit: 12 });
    posts = res.data;
  } catch {/* silencia */}

  return (
    <div className="container-site py-6">
      <Breadcrumb items={[{ label: 'Blog' }]} />

      <div className="mb-8 mt-2">
        <h1 className="text-3xl font-bold text-gray-900">Blog de Electrodomésticos</h1>
        <p className="text-gray-500 mt-2">
          Guías de compra, comparativas y consejos para sacar el máximo partido a tus electrodomésticos.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-20">
          No hay artículos disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              {/* Imagen */}
              <div className="aspect-video bg-gradient-to-br from-red-50 to-red-100 relative overflow-hidden">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    📰
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-5">
                {post.publishedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
                <h2 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-[#CC0000] transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#CC0000] hover:underline"
                >
                  Leer más <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
