import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination as PaginationData } from '@/types';

interface PaginationProps {
  pagination: PaginationData;
  buildUrl: (page: number) => string;
}

export default function Pagination({ pagination, buildUrl }: PaginationProps) {
  const { page, totalPages, hasNext, hasPrev } = pagination;

  if (totalPages <= 1) return null;

  // Generar rango de páginas a mostrar
  const getPageRange = (): (number | '...')[] => {
    const range: (number | '...')[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      } else if (
        range[range.length - 1] !== '...'
      ) {
        range.push('...');
      }
    }
    return range;
  };

  const pages = getPageRange();

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-center gap-1 flex-wrap py-6"
    >
      {/* Anterior */}
      {hasPrev ? (
        <Link
          href={buildUrl(page - 1)}
          rel="prev"
          aria-label="Página anterior"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 
                     text-gray-600 hover:border-red-300 hover:text-[#CC0000] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {/* Páginas */}
      {pages.map((p, idx) =>
        p === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p as number)}
            aria-label={`Página ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium
                        transition-colors border ${
                          p === page
                            ? 'bg-[#CC0000] text-white border-[#CC0000]'
                            : 'border-gray-200 text-gray-700 hover:border-red-300 hover:text-[#CC0000]'
                        }`}
          >
            {p}
          </Link>
        ),
      )}

      {/* Siguiente */}
      {hasNext ? (
        <Link
          href={buildUrl(page + 1)}
          rel="next"
          aria-label="Página siguiente"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 
                     text-gray-600 hover:border-red-300 hover:text-[#CC0000] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}

      {/* Info total */}
      <p className="w-full text-center text-xs text-gray-400 mt-1">
        Página {page} de {totalPages} ({pagination.total} productos)
      </p>
    </nav>
  );
}
