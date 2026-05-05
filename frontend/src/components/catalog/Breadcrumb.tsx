import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems = [{ label: 'Inicio', href: '/' }, ...items];

  return (
    <nav aria-label="Ruta de navegación" className="py-2">
      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: allItems.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.label,
              item: item.href
                ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jcapi.es'}${item.href}`
                : undefined,
            })),
          }),
        }}
      />

      <ol className="flex items-center flex-wrap gap-1 text-sm" role="list">
        {allItems.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {/* Separador */}
              {!isFirst && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}

              {isLast ? (
                /* Ítem activo */
                <span
                  className="text-gray-900 font-medium truncate max-w-[200px]"
                  aria-current="page"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 inline-block mr-1 text-gray-400" />}
                  {item.label}
                </span>
              ) : (
                /* Enlace */
                <Link
                  href={item.href!}
                  className="breadcrumb-item hover:text-[#CC0000] truncate max-w-[200px] transition-colors"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 inline-block mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
