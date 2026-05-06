/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers de seguridad y SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Redirecciones de URLs
  async redirects() {
    return [
      {
        source: '/tienda',
        destination: '/catalogo',
        permanent: true,
      },
    ];
  },

  // Rewrites para imágenes faltantes
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: 'https://placehold.co/600x600/eeeeee/333333.png?text=Product',
      },
    ];
  },
};

export default nextConfig;
