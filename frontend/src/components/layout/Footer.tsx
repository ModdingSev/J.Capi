import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { CATALOG_CATEGORIES } from '@/lib/categories';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* ── Franja roja superior ── */}
      <div className="bg-[#CC0000] h-1" />

      <div className="container-site py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* ── Columna 1: Logo + Descripción ── */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-white font-bold text-2xl">J. Capi</span>
              <span className="block text-gray-400 text-xs mt-0.5">Electrodomésticos</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Tu tienda de confianza en electrodomésticos. Más de 20 años ofreciendo
              las mejores marcas con servicio técnico propio.
            </p>
            {/* Redes sociales */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook J. Capi"
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-[#CC0000] flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram J. Capi"
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-[#CC0000] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube J. Capi"
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-[#CC0000] flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ── Columna 2: Catálogo ── */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Catálogo
            </h3>
            <ul className="space-y-2">
              {CATALOG_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalogo?category=${cat.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Columna 3: Información ── */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Información
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/blog', label: 'Blog' },
                { href: '/servicio-tecnico', label: 'Servicio Técnico' },
                { href: '/contacto', label: 'Contacto' },
                { href: '/aviso-legal', label: 'Aviso Legal' },
                { href: '/politica-privacidad', label: 'Política de Privacidad' },
                { href: '/politica-cookies', label: 'Política de Cookies' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Columna 4: Contacto ── */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+34900000000"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#CC0000]" />
                  <span>900 000 000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@jcapi.es"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#CC0000]" />
                  <span>info@jcapi.es</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#CC0000]" />
                <span>C/ Principal, 1<br />28000 Madrid</span>
              </li>
            </ul>

            {/* Horario */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Horario</p>
              <p className="text-sm text-gray-400">Lun–Vie: 9:00–20:00</p>
              <p className="text-sm text-gray-400">Sáb: 9:00–14:00</p>
            </div>
          </div>
        </div>

        {/* ── Copyright ── */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {currentYear} J. Capi Electrodomésticos. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <img
              src="/images/payment/visa.svg"
              alt="Visa"
              className="h-5 opacity-50 hover:opacity-100 transition-opacity"
            />
            <img
              src="/images/payment/mastercard.svg"
              alt="Mastercard"
              className="h-5 opacity-50 hover:opacity-100 transition-opacity"
            />
            <img
              src="/images/payment/paypal.svg"
              alt="PayPal"
              className="h-5 opacity-50 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
