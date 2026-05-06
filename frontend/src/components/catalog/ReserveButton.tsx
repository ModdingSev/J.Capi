'use client';

import { ShoppingCart } from 'lucide-react';
import { useReservationCart } from '@/components/ReservationCartProvider';

interface ReserveButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
}

export default function ReserveButton({ product }: ReserveButtonProps) {
  const { addItem } = useReservationCart();

  const handleReserve = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
    });
    alert('Añadido a tus reservas');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <button 
        onClick={handleReserve}
        className="btn-primary flex-1 justify-center py-4 text-base bg-[#CC0000] hover:bg-[#A80000] text-white rounded-lg transition-colors flex items-center"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Añadir a reservas
      </button>
    </div>
  );
}
