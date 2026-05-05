'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { CATALOG_CATEGORIES } from '@/lib/categories';

export default function CatalogTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ocultar si NO estamos en /catalogo/*
  const isInCatalog =
    pathname === '/catalogo' ||
    pathname.startsWith('/catalogo/') ||
    CATALOG_CATEGORIES.some(
      (cat) =>
        pathname.startsWith(`/${cat.slug}`) ||
        cat.subcategories.some((sub) => pathname.startsWith(`/${sub.slug}`)),
    );

  // Cerrar megamenú al hacer click fuera — SIEMPRE antes de cualquier return
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveCategory(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchValue.trim()) {
        router.push(`/catalogo?q=${encodeURIComponent(searchValue.trim())}`);
      } else {
        router.push('/catalogo');
      }
    },
    [router, searchValue],
  );

  if (!isInCatalog) return null;

  const activeCat = CATALOG_CATEGORIES.find((c) => c.slug === activeCategory) ?? null;

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm" ref={menuRef}>
      <div className="container-site">
        <div className="flex items-center gap-4 h-14">

          {/* ── Barra de búsqueda ── */}
          <form
            onSubmit={handleSearch}
            className="shrink-0 w-24 sm:w-32 md:w-44 lg:w-52 xl:w-60"
            role="search"
            aria-label="Buscar productos"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors"
                autoComplete="off"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => { setSearchValue(''); router.push('/catalogo'); }}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>
          </form>

          {/* ── Categorías ── */}
          <nav
            className="flex items-center gap-0.5 overflow-x-auto overflow-y-visible scrollbar-hide flex-1 min-w-0"
            aria-label="Categorías del catálogo"
          >
            {CATALOG_CATEGORIES.map((cat) => {
              const isOpen = activeCategory === cat.slug;
              return (
                <div key={cat.slug} className="flex-shrink-0">
                  <button
                    onClick={() => setActiveCategory(isOpen ? null : cat.slug)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium 
                                whitespace-nowrap transition-colors duration-150
                                ${isOpen
                                  ? 'bg-red-600 text-white'
                                  : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                                }`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    {cat.name}
                    {isOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Mega menú — fuera del nav con overflow, posición absoluta respecto al topbar ── */}
      {activeCat && (
        <div className="absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50 py-4">
          <div className="container-site">
            <div className="flex items-start gap-8">
              <Link
                href={`/catalogo?category=${activeCat.slug}`}
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-2 text-sm font-bold text-gray-900 
                           hover:text-red-700 transition-colors whitespace-nowrap pt-1"
              >
                Ver todos los {activeCat.name}
                <span className="text-gray-400">→</span>
              </Link>
              <div className="w-px self-stretch bg-gray-200" />
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {activeCat.subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/catalogo?category=${sub.slug}`}
                    onClick={() => setActiveCategory(null)}
                    className="text-sm text-gray-600 hover:text-red-700 hover:underline 
                               transition-colors py-1 whitespace-nowrap"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
