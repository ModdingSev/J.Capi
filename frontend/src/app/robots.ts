import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/carrito', '/admin', '/api/'],
      },
    ],
    sitemap: 'https://www.jcapi.es/sitemap.xml',
  };
}
