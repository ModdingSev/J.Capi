'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { LogOut, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    const token = localStorage.getItem('jcapi_admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchReservations(token);
  }, []);

  const fetchReservations = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/reservations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('jcapi_admin_token');
        router.push('/admin');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setReservations(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (id: number) => {
    if (!confirm('¿Marcar reserva como pagada y entregada? Esto descontará el stock.')) return;
    
    const token = localStorage.getItem('jcapi_admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/reservations/${id}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Actualizar estado local
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'COMPLETED' } : r));
        alert('Reserva completada con éxito. Stock actualizado.');
      } else {
        alert(data.error || 'Error al completar');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jcapi_admin_token');
    router.push('/admin');
  };

  if (loading) return <div className="p-10 text-center">Cargando TPV...</div>;

  const filteredReservations = reservations.filter(r => r.status === filter);

  return (
    <div className="container-site py-8">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TPV / Gestor de Reservas</h1>
          <p className="text-sm text-gray-500">Panel de control de tienda física</p>
        </div>
        <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-[#CC0000]">
          <LogOut className="w-5 h-5 mr-2" />
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'PENDING' ? 'bg-[#CC0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Pendientes ({reservations.filter(r => r.status === 'PENDING').length})
        </button>
        <button 
          onClick={() => setFilter('COMPLETED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Completadas
        </button>
      </div>

      {/* Listado */}
      <div className="grid gap-6">
        {filteredReservations.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl border border-gray-100 text-gray-500">
            No hay reservas en este estado.
          </div>
        ) : (
          filteredReservations.map(res => (
            <div key={res.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-mono">#RES-{res.id}</span>
                  {res.status === 'PENDING' ? (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center font-medium"><Clock className="w-3 h-3 mr-1"/> Pendiente</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center font-medium"><CheckCircle className="w-3 h-3 mr-1"/> Completada</span>
                  )}
                  <span className="text-sm text-gray-500">{new Date(res.createdAt).toLocaleString()}</span>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{res.customerName}</h3>
                  <p className="text-gray-600 text-sm">📞 {res.customerPhone} {res.customerEmail ? `| ✉️ ${res.customerEmail}` : ''}</p>
                  {res.notes && <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded italic">" {res.notes} "</p>}
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">Productos:</h4>
                <ul className="space-y-2">
                  {res.items.map((item: any) => (
                    <li key={item.id} className="text-sm flex justify-between">
                      <span className="text-gray-800"><span className="font-bold">{item.quantity}x</span> {item.product?.name || 'Producto borrado'}</span>
                      <span className="text-gray-500">{formatPrice(item.price)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-[#CC0000]">{formatPrice(res.total)}</span>
                </div>
              </div>

              {res.status === 'PENDING' && (
                <div className="flex items-center justify-end md:border-l md:pl-6">
                  <button 
                    onClick={() => markAsCompleted(res.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors w-full md:w-auto shadow-sm"
                  >
                    Completar Venta
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
