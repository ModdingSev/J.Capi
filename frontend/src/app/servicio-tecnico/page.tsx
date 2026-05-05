import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, Wrench, Star } from 'lucide-react';
import Breadcrumb from '@/components/catalog/Breadcrumb';

export const metadata: Metadata = {
  title: 'Servicio Técnico Oficial de Electrodomésticos',
  description:
    'Servicio técnico oficial para todas las marcas de electrodomésticos. Técnicos certificados, recambios originales y reparación rápida. Llama al 900 000 000.',
  alternates: { canonical: '/servicio-tecnico' },
};

const BRANDS_SERVICE = ['Samsung', 'LG', 'Bosch', 'Siemens', 'Whirlpool', 'Beko', 'Balay', 'AEG', 'Electrolux', 'Indesit'];

const SERVICES = [
  { title: 'Reparación en domicilio', desc: 'Nuestros técnicos se desplazan a tu hogar en menos de 48h.' },
  { title: 'Diagnóstico gratuito', desc: 'Evaluación sin coste del problema antes de presupuestar la reparación.' },
  { title: 'Recambios originales', desc: 'Solo utilizamos piezas originales del fabricante para todas las reparaciones.' },
  { title: 'Garantía de reparación', desc: '12 meses de garantía en todas las reparaciones realizadas por nuestro equipo.' },
];

export default function ServicioTecnicoPage() {
  return (
    <div className="container-site py-6">
      <Breadcrumb items={[{ label: 'Servicio Técnico' }]} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#CC0000] to-[#880000] rounded-2xl p-8 md:p-12 text-white mb-10 mt-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Servicio Técnico Oficial
            </h1>
            <p className="text-red-100 text-lg max-w-xl">
              Reparamos todos los electrodomésticos con técnicos certificados y recambios originales.
              Servicio rápido, eficiente y con garantía.
            </p>
            <a
              href="tel:+34900000000"
              className="mt-6 inline-flex items-center gap-2 bg-white text-[#CC0000] font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Llamar ahora: 900 000 000
            </a>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <section aria-labelledby="servicios-heading" className="mb-12">
        <h2 id="servicios-heading" className="text-2xl font-bold text-gray-900 mb-6">
          ¿Qué incluye nuestro servicio?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-[#CC0000]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas */}
      <section aria-labelledby="marcas-heading" className="mb-12">
        <h2 id="marcas-heading" className="text-2xl font-bold text-gray-900 mb-4">
          Marcas que reparamos
        </h2>
        <div className="flex flex-wrap gap-3">
          {BRANDS_SERVICE.map((brand) => (
            <span
              key={brand}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-red-300 hover:text-[#CC0000] transition-colors"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Contacto y horario */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-start gap-3">
          <Phone className="w-5 h-5 text-[#CC0000] mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Teléfono</p>
            <a href="tel:+34900000000" className="text-sm text-[#CC0000] hover:underline">900 000 000</a>
            <p className="text-xs text-gray-400 mt-0.5">Línea gratuita</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-start gap-3">
          <Mail className="w-5 h-5 text-[#CC0000] mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Email</p>
            <a href="mailto:tecnico@jcapi.es" className="text-sm text-[#CC0000] hover:underline">tecnico@jcapi.es</a>
            <p className="text-xs text-gray-400 mt-0.5">Respuesta en 24h</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#CC0000] mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Horario</p>
            <p className="text-sm text-gray-700">Lun–Vie: 8:00–20:00</p>
            <p className="text-sm text-gray-700">Sáb: 9:00–14:00</p>
          </div>
        </div>
      </section>

      {/* Formulario de solicitud */}
      <section aria-labelledby="form-heading" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h2 id="form-heading" className="text-xl font-bold text-gray-900 mb-6">
          Solicitar servicio técnico
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-5" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input type="text" id="name" name="name" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input type="tel" id="phone" name="phone" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div>
            <label htmlFor="appliance" className="block text-sm font-medium text-gray-700 mb-1">Electrodoméstico *</label>
            <select id="appliance" name="appliance" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              <option value="">Selecciona tipo</option>
              <option>Lavadora</option>
              <option>Secadora</option>
              <option>Frigorífico</option>
              <option>Lavavajillas</option>
              <option>Horno</option>
              <option>Microondas</option>
              <option>Placa de cocción</option>
              <option>Otro</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción de la avería *</label>
            <textarea id="description" name="description" rows={4} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" placeholder="Describe el problema que tiene tu electrodoméstico..." />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary">
              Solicitar servicio
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
