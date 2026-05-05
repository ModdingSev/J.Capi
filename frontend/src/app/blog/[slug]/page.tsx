import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import type { BlogListItem } from '@/types';
import { getBlogPost, getBlogPosts } from '@/lib/api';
import Breadcrumb from '@/components/catalog/Breadcrumb';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const data = await getBlogPosts({ page: 1, limit: 100 });
    return data.data.map((p: BlogListItem) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await getBlogPost(params.slug);
    if (!res?.data) return {};
    const post = res.data;
    return {
      title: `${post.title} — Blog J. Capi`,
      description: post.excerpt ?? `Lee el artículo "${post.title}" en el blog de J. Capi.`,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt ?? undefined,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
        type: 'article',
        publishedTime: post.publishedAt ?? undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
  let res: Awaited<ReturnType<typeof getBlogPost>> | undefined;
  try {
    res = await getBlogPost(params.slug);
  } catch {
    notFound();
  }
  if (!res?.data) notFound();

  const post = res!.data;
  const related = res!.related;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'J. Capi Electrodomésticos',
      url: 'https://www.jcapi.es',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="container-site py-6">
        <Breadcrumb
          items={[
            { label: 'Blog', href: '/blog' },
            { label: post.title },
          ]}
        />

        <article className="max-w-3xl mx-auto mt-6">
          {/* Cover */}
          {post.coverImage && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <CalendarDays className="w-4 h-4" />
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Publicado recientemente'}
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          {/* Content */}
          <div
            className="prose prose-gray prose-headings:font-bold prose-a:text-[#CC0000] 
                       prose-img:rounded-xl max-w-none text-gray-700 leading-relaxed"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {post.content}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#CC0000] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al blog
            </Link>
          </div>
        </article>

        {/* Related posts */}
        {related && related.length > 0 && (
          <section className="max-w-3xl mx-auto mt-14">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Artículos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-100 
                             shadow-sm hover:shadow-md transition-shadow"
                >
                  {r.coverImage && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={r.coverImage}
                        alt={r.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">
                      {r.publishedAt
                        ? new Date(r.publishedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : ''}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#CC0000] transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
