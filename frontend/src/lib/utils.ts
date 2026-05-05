import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price));
}

export function getDiscountPercent(price: string | number, comparePrice: string | number | null | undefined): number | null {
  if (!comparePrice) return null;
  const p = Number(price);
  const cp = Number(comparePrice);
  if (cp <= p) return null;
  return Math.round(((cp - p) / cp) * 100);
}

export function getEnergyColor(rating: string | null | undefined): string {
  const colors: Record<string, string> = {
    'A+++': '#00A550',
    'A++': '#2CB34A',
    'A+': '#57B832',
    A: '#8DC63F',
    B: '#C7D528',
    C: '#FFF200',
    D: '#FBB040',
    E: '#F37021',
    F: '#ED1C24',
    G: '#BE1E2D',
  };
  return colors[rating ?? ''] ?? '#888888';
}

export function getPrimaryImage(images: { url: string; alt?: string | null; isPrimary: boolean }[]): string {
  const primary = images.find((img) => img.isPrimary);
  return primary?.url ?? images[0]?.url ?? '/images/placeholder-product.svg';
}

export function buildCatalogUrl(params: Record<string, string | undefined>): string {
  const base = '/catalogo';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `${base}?${qs.toString()}` : base;
}
