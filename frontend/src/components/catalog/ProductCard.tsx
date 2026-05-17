'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Zap } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, getDiscountPercent, getEnergyColor, getPrimaryImage } from '@/lib/utils';
import { useReservationCart } from '@/components/ReservationCartProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getPrimaryImage(product.images);
  const [imgError, setImgError] = useState(false);
  const discount = getDiscountPercent(product.price, product.comparePrice);
  const energyColor = getEnergyColor(product.energyRating);
  const { addItem } = useReservationCart();

  const handleReserve = (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación si estuviera dentro de un link
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: imageUrl,
    });
    // Opcional: mostrar un toast o mensaje
  };

  return (
    <article className="product-card group">
      {/* ── Imagen ── */}
      <Link href={`/productos/${product.slug}`} className="block relative aspect-square bg-white overflow-hidden">
        {/* Badges */}
        {discount && (
          <span className="badge-sale">-{discount}%</span>
        )}
        {product.isNew && !discount && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            Nuevo
          </span>
        )}

        {/* Imagen del producto */}
        <div className="relative w-full h-full">
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-xs text-center px-4 line-clamp-3">{product.name}</span>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={product.images[0]?.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              unoptimized
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="p-4">
        {/* Marca */}
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          {product.brand.name}
        </p>

        {/* Nombre */}
        <Link
          href={`/productos/${product.slug}`}
          className="block text-sm font-semibold text-gray-900 hover:text-[#CC0000] transition-colors line-clamp-2 mb-2"
        >
          {product.name}
        </Link>

        {/* Descripción corta */}
        {product.shortDesc && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.shortDesc}
          </p>
        )}

        {/* Atributos rápidos */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Eficiencia energética */}
          {product.energyRating && (
            <span
              className="energy-badge text-white text-xs"
              style={{ backgroundColor: energyColor }}
              title={`Eficiencia energética: ${product.energyRating}`}
            >
              <Zap className="w-3 h-3 inline-block mr-0.5" />
              {product.energyRating}
            </span>
          )}
          {/* Capacidad */}
          {product.capacityKg && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {Number(product.capacityKg)}kg
            </span>
          )}
          {/* Ruido */}
          {product.noiseDb && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {product.noiseDb}dB
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#CC0000]">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Botón reservar */}
          <button
            onClick={handleReserve}
            className="flex items-center justify-center w-9 h-9 bg-[#CC0000] hover:bg-[#A80000] 
                       text-white rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label={`Reservar ${product.name}`}
            title="Añadir a reservas"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Stock */}
        {product.stock <= 3 && product.stock > 0 && (
          <p className="text-xs text-orange-600 font-medium mt-2">
            ¡Solo quedan {product.stock} en tienda!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-orange-600 mt-2 font-medium">Bajo pedido (Sin stock actual)</p>
        )}
      </div>
    </article>
  );
}
