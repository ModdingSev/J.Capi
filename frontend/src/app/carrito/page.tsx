'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReservationCart } from '@/components/ReservationCartProvider';
import { formatPrice } from '@/lib/utils';
import { Trash2, ShoppingBag, ShoppingCart } from 'lucide-react';

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useReservationCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Por favor, rellena al menos tu nombre y teléfono.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          notes: formData.notes,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        clearCart();
      } else {
        setError(data.error || 'Error al procesar la reserva.');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container-site py-12 text-center max-w-2xl mx-auto">
        <div className="bg-green-100 text-green-800 p-8 rounded-2xl mb-6">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">¡Reserva confirmada!</h1>
          <p className="text-lg">
            Hemos registrado tus productos. Te avisaremos cuando estén listos para recoger en nuestra tienda.
          </p>
        </div>
        <Link href="/catalogo" className="btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-site py-20 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu lista de reservas está vacía</h1>
        <p className="text-gray-500 mb-8">No has añadido ningún producto para reservar todavía.</p>
        <Link href="/catalogo" className="btn-primary">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container-site py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tus productos a reservar</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Lista de productos */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 items-center border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                <div className="w-20 h-20 relative bg-gray-50 rounded-lg flex-shrink-0">
                  <Image src={item.image || '/images/placeholder.svg'} alt={item.name} fill className="object-contain p-2" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                  <p className="text-[#CC0000] font-bold mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                    className="w-16 p-2 border border-gray-200 rounded text-center"
                  />
                  <button 
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario de reserva */}
        <div className="lg:w-96">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen y Datos</h2>
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
              <span className="text-gray-600">Total estimado:</span>
              <span className="text-2xl font-bold text-[#CC0000]">{formatPrice(totalPrice)}</span>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Esta reserva no requiere pago inmediato. Pagarás al recoger los productos en la tienda.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales (opcional)</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-3 justify-center text-lg mt-2 disabled:opacity-70"
              >
                {loading ? 'Procesando...' : 'Confirmar Reserva en Tienda'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
