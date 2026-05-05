'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/blog', label: 'Blog' },
  { href: '/servicio-tecnico', label: 'Servicio Técnico' },
  { href: '/contacto', label: 'Contacto' },
];

export default function MainTopBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#CC0000] shadow-lg">
      <div className="container-site">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="J. Capi - Ir a inicio"
          >
            <span className="text-white font-bold text-2xl tracking-tight">
              J. Capi
            </span>
            <span className="hidden sm:inline-block text-red-200 text-xs font-medium leading-tight border-l border-red-400 pl-2">
              Electrodomésticos
            </span>
          </Link>

          {/* ── Nav desktop ── */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive(link.href)
                    ? 'bg-red-800 text-white'
                    : 'text-red-100 hover:bg-red-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Acciones ── */}
          <div className="flex items-center gap-2">
            {/* Teléfono (solo desktop) */}
            <a
              href="tel:+34900000000"
              className="hidden xl:flex items-center gap-1.5 text-red-100 hover:text-white text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>900 000 000</span>
            </a>

            {/* Carrito */}
            <Link
              href="/carrito"
              aria-label="Ver carrito"
              className="relative flex items-center justify-center w-10 h-10 rounded-full text-red-100 hover:bg-red-700 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {/* Badge de items */}
              <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Botón menú móvil */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-red-100 hover:bg-red-700 hover:text-white transition-colors"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menú móvil ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-red-800 border-t border-red-700 animate-slide-down">
          <nav className="container-site py-3 flex flex-col gap-1" aria-label="Navegación móvil">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-red-900 text-white'
                    : 'text-red-100 hover:bg-red-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+34900000000"
              className="flex items-center gap-2 px-4 py-3 text-red-100 hover:text-white text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              900 000 000
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
