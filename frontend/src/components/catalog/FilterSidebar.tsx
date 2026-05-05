'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import type { Filters } from '@/types';
import { getEnergyColor } from '@/lib/utils';

interface FilterSidebarProps {
  filters: Filters;
  currentParams: Record<string, string>;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'featured', label: 'Destacados' },
];

export default function FilterSidebar({ filters, currentParams }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceMin, setPriceMin] = useState(currentParams.minPrice ?? '');
  const [priceMax, setPriceMax] = useState(currentParams.maxPrice ?? '');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('page'); // Reset página al filtrar
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (priceMin) params.set('minPrice', priceMin);
    else params.delete('minPrice');
    if (priceMax) params.set('maxPrice', priceMax);
    else params.delete('maxPrice');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.get('category')) params.set('category', searchParams.get('category')!);
    if (searchParams.get('q')) params.set('q', searchParams.get('q')!);
    router.push(`${pathname}?${params.toString()}`);
    setPriceMin('');
    setPriceMax('');
  };

  const hasActiveFilters =
    currentParams.brand ||
    currentParams.minPrice ||
    currentParams.maxPrice ||
    currentParams.energy;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* ── Cabecera filtros ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#CC0000] hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      {/* ── Ordenar por ── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Ordenar por</h3>
        <select
          value={currentParams.sort ?? 'newest'}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 
                     focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Precio ── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Precio (€)</h3>
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
          <input
            type="number"
            placeholder={`Min ${Math.floor(filters.price.min)}`}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            min={0}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <span className="text-gray-400 text-sm flex-shrink-0">–</span>
          <input
            type="number"
            placeholder={`Max ${Math.ceil(filters.price.max)}`}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            min={0}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            type="submit"
            className="flex-shrink-0 bg-[#CC0000] text-white text-xs px-3 py-2 rounded-lg 
                       hover:bg-[#A80000] transition-colors"
          >
            OK
          </button>
        </form>
      </div>

      {/* ── Marcas ── */}
      {filters.brands.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Marca</h3>
          <div className="space-y-1.5">
            {filters.brands.map((brand) => {
              const isSelected = currentParams.brand === brand.slug;
              return (
                <label
                  key={brand.id}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => updateParam('brand', isSelected ? null : brand.slug)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 
                               focus:ring-red-500 cursor-pointer"
                  />
                  <span className={`text-sm transition-colors group-hover:text-[#CC0000] ${isSelected ? 'text-[#CC0000] font-medium' : 'text-gray-700'}`}>
                    {brand.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Eficiencia energética ── */}
      {filters.energyRatings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Eficiencia energética</h3>
          <div className="flex flex-wrap gap-2">
            {filters.energyRatings.map((er) => {
              const isSelected = currentParams.energy?.split(',').includes(er.value);
              const color = getEnergyColor(er.value);
              return (
                <button
                  key={er.value}
                  onClick={() => updateParam('energy', isSelected ? null : er.value)}
                  className={`energy-badge transition-all ${
                    isSelected ? 'ring-2 ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: color,
                    color: 'white',
                    // ring color handled via CSS custom property if needed
                  } as React.CSSProperties}
                  title={`${er.count} productos`}
                >
                  {er.value}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Botón filtros móvil ── */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 btn-secondary text-sm py-2 px-4"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="bg-[#CC0000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 self-start sticky top-[7.5rem] h-[calc(100vh-7.5rem)] overflow-y-auto border-r border-gray-200 bg-white z-30">
        <div className="py-6 px-5">
          <FilterContent />
        </div>
      </aside>

      {/* ── Drawer móvil ── */}
      {drawerOpen && (
        <div className="filter-drawer lg:hidden">
          <div
            className="filter-drawer-overlay"
            onClick={() => setDrawerOpen(false)}
            role="button"
            aria-label="Cerrar filtros"
            tabIndex={0}
          />
          <div className="filter-drawer-panel">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Filtros</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cerrar filtros"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-primary w-full justify-center"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
