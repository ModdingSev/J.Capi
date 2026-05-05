/**
 * Iconos SVG de electrodomésticos para las tarjetas de categoría.
 * Diseño outline, 24×24 viewBox, consistente con el estilo Lucide.
 */

interface IconProps {
  className?: string;
}

/** Frigorífico de dos puertas (congelador arriba, frigorífico abajo) */
export function IconFridge({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Cuerpo */}
      <rect x="5" y="2" width="14" height="20" rx="2" />
      {/* Separador congelador / nevera */}
      <line x1="5" y1="9" x2="19" y2="9" />
      {/* Tirador congelador */}
      <line x1="10" y1="5" x2="10" y2="7.5" />
      {/* Tirador nevera */}
      <line x1="10" y1="12" x2="10" y2="16.5" />
    </svg>
  );
}

/** Congelador arcón (tapa curva con copo de nieve) */
export function IconFreezer({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Cuerpo del arcón */}
      <rect x="2" y="10" width="20" height="11" rx="2" />
      {/* Tapa arqueada */}
      <path d="M2 12 C2 6 22 6 22 12" />
      {/* Copo de nieve */}
      <line x1="12" y1="13" x2="12" y2="18" />
      <line x1="9.5" y1="15.5" x2="14.5" y2="15.5" />
      <line x1="10" y1="13.5" x2="14" y2="17.5" />
      <line x1="14" y1="13.5" x2="10" y2="17.5" />
    </svg>
  );
}

/** Lavadora de carga frontal con portilla */
export function IconWasher({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Cuerpo */}
      <rect x="3" y="2" width="18" height="20" rx="2" />
      {/* Portilla exterior */}
      <circle cx="12" cy="13" r="5" />
      {/* Portilla interior (vidrio) */}
      <circle cx="12" cy="13" r="2.5" />
      {/* Panel de control: barra de programas */}
      <rect x="5" y="4" width="6" height="2.5" rx="0.5" />
      {/* Botones */}
      <circle cx="16" cy="5.25" r="1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="5.25" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Lavavajillas con cesta de platos visible */
export function IconDishwasher({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Cuerpo */}
      <rect x="3" y="2" width="18" height="20" rx="2" />
      {/* Franja de control superior */}
      <line x1="3" y1="7.5" x2="21" y2="7.5" />
      {/* Punto de control */}
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
      {/* Cesta con divisores de platos */}
      <rect x="6" y="11" width="12" height="7" rx="1" />
      <line x1="9.5" y1="11" x2="9.5" y2="18" />
      <line x1="13" y1="11" x2="13" y2="18" />
      <line x1="16.5" y1="11" x2="16.5" y2="18" />
    </svg>
  );
}

/** Placa de cocción con 4 fuegos / zonas de inducción */
export function IconStove({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Superficie */}
      <rect x="2" y="3" width="20" height="18" rx="2" />
      {/* 4 zonas de cocción */}
      <circle cx="8.5" cy="9" r="2.8" />
      <circle cx="15.5" cy="9" r="2.8" />
      <circle cx="8" cy="16.5" r="2" />
      <circle cx="16" cy="16.5" r="2" />
    </svg>
  );
}

/** Horno empotrado con cristal y mandos */
export function IconOven({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Cuerpo */}
      <rect x="2" y="3" width="20" height="18" rx="2" />
      {/* Franja de mandos */}
      <line x1="2" y1="8.5" x2="22" y2="8.5" />
      {/* Tres mandos */}
      <circle cx="6" cy="5.75" r="1.3" />
      <circle cx="12" cy="5.75" r="1.3" />
      <circle cx="18" cy="5.75" r="1.3" />
      {/* Cristal de puerta */}
      <rect x="5" y="10.5" width="14" height="7.5" rx="1" />
    </svg>
  );
}

/** Microondas de sobremesa con puerta y panel de control */
export function IconMicrowave({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Cuerpo exterior */}
      <rect x="1" y="5" width="22" height="14" rx="2" />
      {/* Separador puerta / panel */}
      <line x1="17" y1="5" x2="17" y2="19" />
      {/* Ventana de la puerta */}
      <rect x="3" y="7.5" width="12" height="9" rx="1" />
      {/* Panel de control: dial giratorio */}
      <circle cx="19.5" cy="9.5" r="1.3" />
      {/* Teclas */}
      <line x1="18.2" y1="13" x2="20.8" y2="13" />
      <line x1="18.2" y1="15" x2="20.8" y2="15" />
      <line x1="18.2" y1="17" x2="20.8" y2="17" />
    </svg>
  );
}

/** Mapa de slug → componente icono */
export const APPLIANCE_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  frigorificos: IconFridge,
  congeladores: IconFreezer,
  lavado: IconWasher,
  lavavajillas: IconDishwasher,
  coccion: IconStove,
  hornos: IconOven,
  microondas: IconMicrowave,
};
