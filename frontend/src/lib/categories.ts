// Datos estáticos de las categorías del menú
// Usados tanto en el CatalogTopBar como en el MegaMenu

export const CATALOG_CATEGORIES = [
  {
    name: 'Frigoríficos',
    slug: 'frigorificos',
    subcategories: [
      { name: 'Combi', slug: 'frigorificos-combi' },
      { name: 'Americanos', slug: 'frigorificos-americanos' },
      { name: 'Una Puerta', slug: 'frigorificos-una-puerta' },
      { name: 'Bajo Encimera', slug: 'frigorificos-bajo-encimera' },
    ],
  },
  {
    name: 'Congeladores',
    slug: 'congeladores',
    subcategories: [
      { name: 'Verticales', slug: 'congeladores-verticales' },
      { name: 'Arcón', slug: 'congeladores-arcon' },
    ],
  },
  {
    name: 'Lavado',
    slug: 'lavado',
    subcategories: [
      { name: 'Lavadoras', slug: 'lavadoras' },
      { name: 'Lavadoras-Secadoras', slug: 'lavadoras-secadoras' },
      { name: 'Secadoras', slug: 'secadoras' },
    ],
  },
  {
    name: 'Lavavajillas',
    slug: 'lavavajillas',
    subcategories: [
      { name: '60cm', slug: 'lavavajillas-60cm' },
      { name: '45cm', slug: 'lavavajillas-45cm' },
      { name: 'Bajo Encimera', slug: 'lavavajillas-bajo-encimera' },
    ],
  },
  {
    name: 'Cocción',
    slug: 'coccion',
    subcategories: [
      { name: 'Inducción', slug: 'placas-induccion' },
      { name: 'Vitrocerámica', slug: 'placas-vitroceramica' },
      { name: 'Gas', slug: 'placas-gas' },
      { name: 'Campanas', slug: 'campanas-extractoras' },
    ],
  },
  {
    name: 'Hornos',
    slug: 'hornos',
    subcategories: [
      { name: 'Eléctricos', slug: 'hornos-electricos' },
      { name: 'Gas', slug: 'hornos-gas' },
      { name: 'Compactos', slug: 'hornos-compactos' },
    ],
  },
  {
    name: 'Microondas',
    slug: 'microondas',
    subcategories: [
      { name: 'Sobremesa', slug: 'microondas-sobremesa' },
      { name: 'Integrable', slug: 'microondas-integrable' },
      { name: 'Con Grill', slug: 'microondas-grill' },
    ],
  },
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];
