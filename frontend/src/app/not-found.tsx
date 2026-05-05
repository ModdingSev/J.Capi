import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-[#CC0000]" />
      </div>
      <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Página no encontrada</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Lo sentimos, la página que buscas no existe o ha sido movida. Puedes volver al inicio o
        explorar nuestro catálogo de electrodomésticos.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
        <Link href="/catalogo" className="btn-secondary">
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
