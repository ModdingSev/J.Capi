import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import Breadcrumb from '@/components/catalog/Breadcrumb';

export const metadata: Metadata = {
  title: 'Contacto — J. Capi Electrodomésticos',
  description:
    'Contacta con J. Capi. Estamos disponibles por teléfono, email o en nuestra tienda. Te ayudamos a elegir el mejor electrodoméstico.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoPage() {
  return (
    <div className="container-site py-6">
      <Breadcrumb items={[{ label: 'Contacto' }]} />

      <div className="mb-8 mt-2">
        <h1 className="text-3xl font-bold text-gray-900">Contacto</h1>
        <p className="text-gray-500 mt-2">
          Estamos aquí para ayudarte. Contacta con nosotros por cualquiera de estos medios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info de contacto */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-0.5">Teléfono</p>
              <a href="tel:+34900000000" className="text-sm text-[#CC0000] hover:underline">
                900 000 000
              </a>
              <p className="text-xs text-gray-400 mt-0.5">Línea gratuita</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-0.5">Email</p>
              <a href="mailto:info@jcapi.es" className="text-sm text-[#CC0000] hover:underline">
                info@jcapi.es
              </a>
              <p className="text-xs text-gray-400 mt-0.5">Respondemos en 24h</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-0.5">Dirección</p>
              <p className="text-sm text-gray-700">C/ Principal, 1</p>
              <p className="text-sm text-gray-700">28000 Madrid</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-0.5">Horario</p>
              <p className="text-sm text-gray-700">Lun–Vie: 9:00–20:00</p>
              <p className="text-sm text-gray-700">Sábado: 9:00–14:00</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h2>
          <form className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  placeholder="Tu nombre"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm 
                             focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm 
                             focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">
                Asunto
              </label>
              <input
                type="text"
                id="contact-subject"
                name="subject"
                placeholder="¿En qué podemos ayudarte?"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje *
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                placeholder="Escribe tu mensaje aquí..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-red-400 resize-none transition-shadow"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="privacy"
                name="privacy"
                required
                className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="privacy" className="text-xs text-gray-500">
                Acepto la{' '}
                <a href="/politica-privacidad" className="text-[#CC0000] hover:underline">
                  política de privacidad
                </a>{' '}
                y el tratamiento de mis datos con el fin de gestionar mi consulta.
              </label>
            </div>

            <button type="submit" className="btn-primary">
              <Send className="w-4 h-4" />
              Enviar mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
