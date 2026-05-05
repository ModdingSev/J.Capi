import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ─── MARCAS ──────────────────────────────────────────────────────────────────
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'samsung' },
      update: {},
      create: { name: 'Samsung', slug: 'samsung', logo: '/images/brands/samsung.svg' },
    }),
    prisma.brand.upsert({
      where: { slug: 'lg' },
      update: {},
      create: { name: 'LG', slug: 'lg', logo: '/images/brands/lg.svg' },
    }),
    prisma.brand.upsert({
      where: { slug: 'bosch' },
      update: {},
      create: { name: 'Bosch', slug: 'bosch', logo: '/images/brands/bosch.svg' },
    }),
    prisma.brand.upsert({
      where: { slug: 'siemens' },
      update: {},
      create: { name: 'Siemens', slug: 'siemens', logo: '/images/brands/siemens.svg' },
    }),
    prisma.brand.upsert({
      where: { slug: 'whirlpool' },
      update: {},
      create: { name: 'Whirlpool', slug: 'whirlpool', logo: '/images/brands/whirlpool.svg' },
    }),
    prisma.brand.upsert({
      where: { slug: 'beko' },
      update: {},
      create: { name: 'Beko', slug: 'beko', logo: '/images/brands/beko.svg' },
    }),
  ]);

  const [samsung, lg, bosch, siemens, whirlpool, beko] = brands;
  console.log('✅ Marcas creadas:', brands.map(b => b.name).join(', '));

  // ─── CATEGORÍAS PRINCIPALES ──────────────────────────────────────────────────
  const catFrigorificos = await prisma.category.upsert({
    where: { slug: 'frigorificos' },
    update: {},
    create: {
      name: 'Frigoríficos',
      slug: 'frigorificos',
      description: 'Frigoríficos de todas las capacidades y estilos',
      image: '/images/categories/frigorificos.jpg',
      sortOrder: 1,
    },
  });

  const catCongeladores = await prisma.category.upsert({
    where: { slug: 'congeladores' },
    update: {},
    create: {
      name: 'Congeladores',
      slug: 'congeladores',
      description: 'Congeladores verticales y horizontales',
      image: '/images/categories/congeladores.jpg',
      sortOrder: 2,
    },
  });

  const catLavado = await prisma.category.upsert({
    where: { slug: 'lavado' },
    update: {},
    create: {
      name: 'Lavado',
      slug: 'lavado',
      description: 'Lavadoras, lavadoras-secadoras y secadoras',
      image: '/images/categories/lavado.jpg',
      sortOrder: 3,
    },
  });

  const catLavavajillas = await prisma.category.upsert({
    where: { slug: 'lavavajillas' },
    update: {},
    create: {
      name: 'Lavavajillas',
      slug: 'lavavajillas',
      description: 'Lavavajillas de todos los tamaños',
      image: '/images/categories/lavavajillas.jpg',
      sortOrder: 4,
    },
  });

  const catCoccion = await prisma.category.upsert({
    where: { slug: 'coccion' },
    update: {},
    create: {
      name: 'Cocción',
      slug: 'coccion',
      description: 'Placas de cocción y campanas extractoras',
      image: '/images/categories/coccion.jpg',
      sortOrder: 5,
    },
  });

  const catHornos = await prisma.category.upsert({
    where: { slug: 'hornos' },
    update: {},
    create: {
      name: 'Hornos',
      slug: 'hornos',
      description: 'Hornos eléctricos, de gas y compactos',
      image: '/images/categories/hornos.jpg',
      sortOrder: 6,
    },
  });

  const catMicroondas = await prisma.category.upsert({
    where: { slug: 'microondas' },
    update: {},
    create: {
      name: 'Microondas',
      slug: 'microondas',
      description: 'Microondas de sobremesa, integrables y con grill',
      image: '/images/categories/microondas.jpg',
      sortOrder: 7,
    },
  });

  console.log('✅ Categorías principales creadas');

  // ─── SUBCATEGORÍAS ───────────────────────────────────────────────────────────
  // Frigoríficos
  await Promise.all([
    prisma.category.upsert({ where: { slug: 'frigorificos-combi' }, update: {}, create: { name: 'Frigoríficos Combi', slug: 'frigorificos-combi', parentId: catFrigorificos.id, sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'frigorificos-americanos' }, update: {}, create: { name: 'Frigoríficos Americanos', slug: 'frigorificos-americanos', parentId: catFrigorificos.id, sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'frigorificos-una-puerta' }, update: {}, create: { name: 'Frigoríficos Una Puerta', slug: 'frigorificos-una-puerta', parentId: catFrigorificos.id, sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'frigorificos-bajo-encimera' }, update: {}, create: { name: 'Frigoríficos Bajo Encimera', slug: 'frigorificos-bajo-encimera', parentId: catFrigorificos.id, sortOrder: 4 } }),
  ]);

  // Congeladores
  await Promise.all([
    prisma.category.upsert({ where: { slug: 'congeladores-verticales' }, update: {}, create: { name: 'Congeladores Verticales', slug: 'congeladores-verticales', parentId: catCongeladores.id, sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'congeladores-arcon' }, update: {}, create: { name: 'Congeladores Arcón', slug: 'congeladores-arcon', parentId: catCongeladores.id, sortOrder: 2 } }),
  ]);

  // Lavado — las usaremos para los productos de prueba
  const subLavadoras = await prisma.category.upsert({ where: { slug: 'lavadoras' }, update: {}, create: { name: 'Lavadoras', slug: 'lavadoras', parentId: catLavado.id, sortOrder: 1 } });
  const subLavadorasSecadoras = await prisma.category.upsert({ where: { slug: 'lavadoras-secadoras' }, update: {}, create: { name: 'Lavadoras-Secadoras', slug: 'lavadoras-secadoras', parentId: catLavado.id, sortOrder: 2 } });
  const subSecadoras = await prisma.category.upsert({ where: { slug: 'secadoras' }, update: {}, create: { name: 'Secadoras', slug: 'secadoras', parentId: catLavado.id, sortOrder: 3 } });

  // Lavavajillas
  await Promise.all([
    prisma.category.upsert({ where: { slug: 'lavavajillas-60cm' }, update: {}, create: { name: 'Lavavajillas 60cm', slug: 'lavavajillas-60cm', parentId: catLavavajillas.id, sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'lavavajillas-45cm' }, update: {}, create: { name: 'Lavavajillas 45cm', slug: 'lavavajillas-45cm', parentId: catLavavajillas.id, sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'lavavajillas-bajo-encimera' }, update: {}, create: { name: 'Lavavajillas Bajo Encimera', slug: 'lavavajillas-bajo-encimera', parentId: catLavavajillas.id, sortOrder: 3 } }),
  ]);

  // Cocción
  await Promise.all([
    prisma.category.upsert({ where: { slug: 'placas-induccion' }, update: {}, create: { name: 'Placas de Inducción', slug: 'placas-induccion', parentId: catCoccion.id, sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'placas-vitroceramica' }, update: {}, create: { name: 'Placas Vitrocerámica', slug: 'placas-vitroceramica', parentId: catCoccion.id, sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'placas-gas' }, update: {}, create: { name: 'Placas de Gas', slug: 'placas-gas', parentId: catCoccion.id, sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'campanas-extractoras' }, update: {}, create: { name: 'Campanas Extractoras', slug: 'campanas-extractoras', parentId: catCoccion.id, sortOrder: 4 } }),
  ]);

  // Hornos
  await Promise.all([
    prisma.category.upsert({ where: { slug: 'hornos-electricos' }, update: {}, create: { name: 'Hornos Eléctricos', slug: 'hornos-electricos', parentId: catHornos.id, sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'hornos-gas' }, update: {}, create: { name: 'Hornos de Gas', slug: 'hornos-gas', parentId: catHornos.id, sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'hornos-compactos' }, update: {}, create: { name: 'Hornos Compactos', slug: 'hornos-compactos', parentId: catHornos.id, sortOrder: 3 } }),
  ]);

  // Microondas
  await Promise.all([
    prisma.category.upsert({ where: { slug: 'microondas-sobremesa' }, update: {}, create: { name: 'Microondas Sobremesa', slug: 'microondas-sobremesa', parentId: catMicroondas.id, sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'microondas-integrable' }, update: {}, create: { name: 'Microondas Integrable', slug: 'microondas-integrable', parentId: catMicroondas.id, sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'microondas-grill' }, update: {}, create: { name: 'Microondas con Grill', slug: 'microondas-grill', parentId: catMicroondas.id, sortOrder: 3 } }),
  ]);

  console.log('✅ Subcategorías creadas');

  // ─── PRODUCTOS DE PRUEBA: LAVADO ─────────────────────────────────────────────
  type ProductSeed = Parameters<typeof prisma.product.create>[0]['data'];

  const lavadoProducts: ProductSeed[] = [
    // ── Lavadoras ──
    {
      name: 'Samsung WW90T534DTT Lavadora 9kg Inox',
      slug: 'samsung-ww90t534dtt-lavadora-9kg-inox',
      shortDesc: 'Lavadora de carga frontal 9kg, motor inverter, clase A, inox',
      description: 'La Samsung WW90T534DTT es una lavadora de carga frontal con capacidad de 9 kg que incorpora tecnología EcoBubble para lavar eficientemente incluso con agua fría. Su motor Digital Inverter garantiza un funcionamiento silencioso y duradero. Compatible con app SmartThings para control remoto.',
      price: '599.00',
      comparePrice: '749.00',
      sku: 'WW90T534DTT',
      brand: { connect: { id: samsung.id } },
      category: { connect: { id: subLavadoras.id } },
      weightKg: '72.0',
      heightCm: '85.0',
      widthCm: '60.0',
      depthCm: '55.0',
      energyRating: 'A',
      capacityKg: '9.0',
      noiseDb: 72,
      isFeatured: true,
      isNew: false,
      metaTitle: 'Samsung WW90T534DTT Lavadora 9kg Inox | J. Capi',
      metaDescription: 'Compra la lavadora Samsung WW90T534DTT 9kg con tecnología EcoBubble, motor inverter y clase A. Envío rápido en J. Capi.',
      images: { create: [{ url: '/images/products/samsung-ww90t534dtt-1.jpg', alt: 'Samsung WW90T534DTT frontal', isPrimary: true, sortOrder: 1 }, { url: '/images/products/samsung-ww90t534dtt-2.jpg', alt: 'Samsung WW90T534DTT interior', sortOrder: 2 }] },
    },
    {
      name: 'LG F4WV509S1E Lavadora 9kg Vapor Blanca',
      slug: 'lg-f4wv509s1e-lavadora-9kg-vapor-blanca',
      shortDesc: 'Lavadora 9kg con tecnología Vapor, motor Direct Drive, clase A',
      description: 'La LG F4WV509S1E destaca por su función TrueSteam que elimina el 99,9% de los alérgenos y reduce las arrugas hasta un 30%. El motor Direct Drive de LG está directamente acoplado al tambor, ofreciendo mayor eficiencia y 10 años de garantía en el motor.',
      price: '649.00',
      comparePrice: '799.00',
      sku: 'F4WV509S1E',
      brand: { connect: { id: lg.id } },
      category: { connect: { id: subLavadoras.id } },
      weightKg: '69.0',
      heightCm: '85.0',
      widthCm: '60.0',
      depthCm: '56.5',
      energyRating: 'A',
      capacityKg: '9.0',
      noiseDb: 47,
      isFeatured: true,
      isNew: true,
      metaTitle: 'LG F4WV509S1E Lavadora 9kg Vapor | J. Capi',
      metaDescription: 'Lavadora LG F4WV509S1E 9kg con TrueSteam y motor Direct Drive 10 años de garantía. Oferta en J. Capi.',
      images: { create: [{ url: '/images/products/lg-f4wv509s1e-1.jpg', alt: 'LG F4WV509S1E frontal', isPrimary: true, sortOrder: 1 }] },
    },
    {
      name: 'Bosch WAV28K43ES Lavadora 9kg Serie 8 Inox',
      slug: 'bosch-wav28k43es-lavadora-9kg-serie-8',
      shortDesc: 'Lavadora Serie 8, 9kg, 1400rpm, i-DOS dosificación automática, clase A',
      description: 'La lavadora Bosch WAV28K43ES de la Serie 8 incluye el sistema i-DOS de dosificación automática de detergente líquido que ahorra hasta un 64% en detergente. El motor EcoSilence Drive proporciona un funcionamiento especialmente silencioso con 1400 rpm.',
      price: '899.00',
      comparePrice: null,
      sku: 'WAV28K43ES',
      brand: { connect: { id: bosch.id } },
      category: { connect: { id: subLavadoras.id } },
      weightKg: '77.0',
      heightCm: '84.8',
      widthCm: '59.8',
      depthCm: '59.0',
      energyRating: 'A',
      capacityKg: '9.0',
      noiseDb: 48,
      isFeatured: false,
      isNew: false,
      metaTitle: 'Bosch WAV28K43ES Serie 8 Lavadora 9kg i-DOS | J. Capi',
      metaDescription: 'Lavadora Bosch Serie 8 WAV28K43ES con i-DOS dosificación automática. Ahorra detergente y agua.',
      images: { create: [{ url: '/images/products/bosch-wav28k43es-1.jpg', alt: 'Bosch WAV28K43ES Serie 8', isPrimary: true, sortOrder: 1 }] },
    },
    {
      name: 'Siemens WM16XKH0ES Lavadora 10kg iQ700 Inox',
      slug: 'siemens-wm16xkh0es-lavadora-10kg-iq700',
      shortDesc: 'Lavadora iQ700, 10kg, 1600rpm, i-DOS, Home Connect, clase A',
      description: 'La lavadora Siemens WM16XKH0ES de la serie iQ700 es una de las más completas del mercado. Con 10 kg de capacidad, 1600 rpm, dosificación automática i-DOS y conectividad Home Connect para controlarla desde el smartphone.',
      price: '1099.00',
      comparePrice: '1299.00',
      sku: 'WM16XKH0ES',
      brand: { connect: { id: siemens.id } },
      category: { connect: { id: subLavadoras.id } },
      weightKg: '81.0',
      heightCm: '84.8',
      widthCm: '59.8',
      depthCm: '59.0',
      energyRating: 'A',
      capacityKg: '10.0',
      noiseDb: 46,
      isFeatured: true,
      isNew: true,
      metaTitle: 'Siemens WM16XKH0ES iQ700 Lavadora 10kg | J. Capi',
      metaDescription: 'Lavadora Siemens iQ700 10kg con i-DOS y Home Connect. La gama alta de Siemens en J. Capi.',
      images: { create: [{ url: '/images/products/siemens-wm16xkh0es-1.jpg', alt: 'Siemens WM16XKH0ES iQ700', isPrimary: true, sortOrder: 1 }] },
    },
    {
      name: 'Beko WTV8736XS Lavadora 8kg 1400rpm Inox',
      slug: 'beko-wtv8736xs-lavadora-8kg-inox',
      shortDesc: 'Lavadora 8kg, 1400rpm, Motor ProSmart Inverter, SteamCure, clase A',
      description: 'La Beko WTV8736XS es una lavadora robusta de 8 kg con motor ProSmart Inverter que garantiza una larga vida útil y menor consumo energético. La función SteamCure elimina bacterias y suaviza la ropa sin necesidad de planchado.',
      price: '399.00',
      comparePrice: '499.00',
      sku: 'WTV8736XS',
      brand: { connect: { id: beko.id } },
      category: { connect: { id: subLavadoras.id } },
      weightKg: '62.0',
      heightCm: '84.0',
      widthCm: '60.0',
      depthCm: '54.0',
      energyRating: 'A',
      capacityKg: '8.0',
      noiseDb: 71,
      isFeatured: false,
      isNew: false,
      metaTitle: 'Beko WTV8736XS Lavadora 8kg Motor Inverter | J. Capi',
      metaDescription: 'Lavadora Beko 8kg con motor ProSmart Inverter y SteamCure al mejor precio en J. Capi.',
      images: { create: [{ url: '/images/products/beko-wtv8736xs-1.jpg', alt: 'Beko WTV8736XS', isPrimary: true, sortOrder: 1 }] },
    },
    {
      name: 'Whirlpool FSCR80410 Lavadora 8kg FreshCare+',
      slug: 'whirlpool-fscr80410-lavadora-8kg-freshcare',
      shortDesc: 'Lavadora 8kg, FreshCare+ 6ºSense, 1400rpm, clase A',
      description: 'La Whirlpool FSCR80410 incorpora la tecnología FreshCare+ que mantiene la ropa fresca durante 6 horas después del lavado gracias a un sistema de ventilación por vapor. La tecnología 6ºSense adapta automáticamente cada ciclo a la carga real.',
      price: '449.00',
      comparePrice: null,
      sku: 'FSCR80410',
      brand: { connect: { id: whirlpool.id } },
      category: { connect: { id: subLavadoras.id } },
      weightKg: '65.0',
      heightCm: '85.0',
      widthCm: '59.5',
      depthCm: '60.5',
      energyRating: 'A',
      capacityKg: '8.0',
      noiseDb: 53,
      isFeatured: false,
      isNew: false,
      metaTitle: 'Whirlpool FSCR80410 Lavadora 8kg FreshCare+ | J. Capi',
      metaDescription: 'Lavadora Whirlpool 8kg con FreshCare+ y tecnología 6ºSense. Compra online en J. Capi.',
      images: { create: [{ url: '/images/products/whirlpool-fscr80410-1.jpg', alt: 'Whirlpool FSCR80410 FreshCare+', isPrimary: true, sortOrder: 1 }] },
    },
    // ── Lavadoras-Secadoras ──
    {
      name: 'Samsung WD90T534DBN Lavadora-Secadora 9/6kg Inox',
      slug: 'samsung-wd90t534dbn-lavadora-secadora-9-6kg',
      shortDesc: 'Lavadora-secadora 9/6kg, AI Control, EcoBubble, clase D',
      description: 'La Samsung WD90T534DBN combina lavadora y secadora en un solo equipo con capacidades de 9kg en lavado y 6kg en secado. La IA optimiza cada ciclo adaptándose a los hábitos de uso. Incluye función Higiene a Vapor para una desinfección profunda.',
      price: '799.00',
      comparePrice: '999.00',
      sku: 'WD90T534DBN',
      brand: { connect: { id: samsung.id } },
      category: { connect: { id: subLavadorasSecadoras.id } },
      weightKg: '78.0',
      heightCm: '85.0',
      widthCm: '60.0',
      depthCm: '60.0',
      energyRating: 'D',
      capacityKg: '9.0',
      noiseDb: 52,
      isFeatured: true,
      isNew: false,
      metaTitle: 'Samsung WD90T534DBN Lavadora-Secadora 9/6kg | J. Capi',
      metaDescription: 'Lavadora-secadora Samsung 9/6kg con AI Control y EcoBubble. Ahorra espacio con 2 en 1.',
      images: { create: [{ url: '/images/products/samsung-wd90t534dbn-1.jpg', alt: 'Samsung WD90T534DBN lavadora-secadora', isPrimary: true, sortOrder: 1 }] },
    },
    {
      name: 'LG F4DV709H2T Lavadora-Secadora 9/6kg Vapor',
      slug: 'lg-f4dv709h2t-lavadora-secadora-9-6kg-vapor',
      shortDesc: 'Lavadora-secadora 9/6kg, Dual Inverter Heat Pump, ThinQ AI, clase A',
      description: 'La LG F4DV709H2T es la solución todo-en-uno más eficiente con tecnología Heat Pump para el secado, que consume hasta un 50% menos de energía que el secado convencional. El motor Dual Inverter garantiza 20 años de vida útil.',
      price: '1099.00',
      comparePrice: '1349.00',
      sku: 'F4DV709H2T',
      brand: { connect: { id: lg.id } },
      category: { connect: { id: subLavadorasSecadoras.id } },
      weightKg: '81.0',
      heightCm: '85.0',
      widthCm: '60.0',
      depthCm: '60.0',
      energyRating: 'A',
      capacityKg: '9.0',
      noiseDb: 51,
      isFeatured: true,
      isNew: true,
      metaTitle: 'LG F4DV709H2T Lavadora-Secadora Heat Pump | J. Capi',
      metaDescription: 'Lavadora-secadora LG Heat Pump 9/6kg clase A+. La más eficiente del mercado en J. Capi.',
      images: { create: [{ url: '/images/products/lg-f4dv709h2t-1.jpg', alt: 'LG F4DV709H2T lavadora-secadora', isPrimary: true, sortOrder: 1 }] },
    },
    {
      name: 'Bosch WNA144V0ES Lavadora-Secadora 9/6kg Serie 6',
      slug: 'bosch-wna144v0es-lavadora-secadora-9-6kg-serie6',
      shortDesc: 'Lavadora-secadora Serie 6, 9/6kg, AutoDry, Home Connect, clase E',
      description: 'La Bosch WNA144V0ES de la Serie 6 es una lavadora-secadora con la tecnología AutoDry que detecta automáticamente la humedad residual y detiene el ciclo cuando la ropa está perfectamente seca. Conectividad Home Connect para gestión remota.',
      price: '849.00',
      comparePrice: null,
      sku: 'WNA144V0ES',
      brand: { connect: { id: bosch.id } },
      category: { connect: { id: subLavadorasSecadoras.id } },
      weightKg: '79.0',
      heightCm: '84.8',
      widthCm: '59.8',
      depthCm: '59.0',
      energyRating: 'E',
      capacityKg: '9.0',
      noiseDb: 54,
      isFeatured: false,
      isNew: false,
      metaTitle: 'Bosch WNA144V0ES Serie 6 Lavadora-Secadora 9/6kg | J. Capi',
      metaDescription: 'Lavadora-secadora Bosch Serie 6 con AutoDry y Home Connect. Compra en J. Capi.',
      images: { create: [{ url: '/images/products/bosch-wna144v0es-1.jpg', alt: 'Bosch WNA144V0ES Serie 6', isPrimary: true, sortOrder: 1 }] },
    },
    // ── Secadoras ──
    {
      name: 'Samsung DV90T8240SH Secadora 9kg Heat Pump Inox',
      slug: 'samsung-dv90t8240sh-secadora-9kg-heat-pump',
      shortDesc: 'Secadora bomba de calor 9kg, AI Control, clase A+++',
      description: 'La Samsung DV90T8240SH es una secadora de bomba de calor de alta eficiencia energética clase A+++. La Inteligencia Artificial optimiza los ciclos de secado y la función Higiene Vapor higieniza la ropa eliminando el 99,9% de las bacterias.',
      price: '799.00',
      comparePrice: '999.00',
      sku: 'DV90T8240SH',
      brand: { connect: { id: samsung.id } },
      category: { connect: { id: subSecadoras.id } },
      weightKg: '46.0',
      heightCm: '85.0',
      widthCm: '60.0',
      depthCm: '60.0',
      energyRating: 'A',
      capacityKg: '9.0',
      noiseDb: 65,
      isFeatured: true,
      isNew: false,
      metaTitle: 'Samsung DV90T8240SH Secadora 9kg Bomba de Calor | J. Capi',
      metaDescription: 'Secadora Samsung bomba de calor 9kg clase A+++. Máxima eficiencia energética en J. Capi.',
      images: { create: [{ url: '/images/products/samsung-dv90t8240sh-1.jpg', alt: 'Samsung DV90T8240SH secadora', isPrimary: true, sortOrder: 1 }] },
    },
    {
      name: 'Bosch WTW87569ES Secadora 9kg Heat Pump Serie 8',
      slug: 'bosch-wtw87569es-secadora-9kg-heat-pump-serie8',
      shortDesc: 'Secadora bomba de calor Serie 8, 9kg, AutoDry, SelfCleaning Condenser, clase A',
      description: 'La Bosch WTW87569ES Serie 8 incorpora el condensador de autolimpieza (SelfCleaning Condenser) que garantiza una eficiencia máxima durante toda la vida del aparato, sin necesidad de limpieza manual.',
      price: '949.00',
      comparePrice: null,
      sku: 'WTW87569ES',
      brand: { connect: { id: bosch.id } },
      category: { connect: { id: subSecadoras.id } },
      weightKg: '44.0',
      heightCm: '84.2',
      widthCm: '59.8',
      depthCm: '61.3',
      energyRating: 'A',
      capacityKg: '9.0',
      noiseDb: 64,
      isFeatured: false,
      isNew: false,
      metaTitle: 'Bosch WTW87569ES Serie 8 Secadora Bomba de Calor | J. Capi',
      metaDescription: 'Secadora Bosch Serie 8 con SelfCleaning Condenser y bomba de calor. En J. Capi.',
      images: { create: [{ url: '/images/products/bosch-wtw87569es-1.jpg', alt: 'Bosch WTW87569ES secadora Serie 8', isPrimary: true, sortOrder: 1 }] },
    },
    {
      name: 'LG RC90V9AV2Q Secadora 9kg Heat Pump Dual Inverter',
      slug: 'lg-rc90v9av2q-secadora-9kg-heat-pump',
      shortDesc: 'Secadora bomba de calor 9kg, Dual Inverter, ThinQ AI, clase A+++',
      description: 'La LG RC90V9AV2Q es una secadora de bomba de calor con motor Dual Inverter de muy larga durabilidad. La función ThinQ AI aprende los patrones de uso y sugiere ciclos óptimos. Compatible con asistentes de voz como Google Assistant y Amazon Alexa.',
      price: '849.00',
      comparePrice: '1049.00',
      sku: 'RC90V9AV2Q',
      brand: { connect: { id: lg.id } },
      category: { connect: { id: subSecadoras.id } },
      weightKg: '43.0',
      heightCm: '85.0',
      widthCm: '60.0',
      depthCm: '69.0',
      energyRating: 'A',
      capacityKg: '9.0',
      noiseDb: 63,
      isFeatured: true,
      isNew: true,
      metaTitle: 'LG RC90V9AV2Q Secadora 9kg Heat Pump ThinQ AI | J. Capi',
      metaDescription: 'Secadora LG 9kg con bomba de calor, ThinQ AI y motor Dual Inverter. Mejor precio en J. Capi.',
      images: { create: [{ url: '/images/products/lg-rc90v9av2q-1.jpg', alt: 'LG RC90V9AV2Q secadora', isPrimary: true, sortOrder: 1 }] },
    },
  ];

  for (const product of lavadoProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug as string },
      update: {},
      create: product,
    });
  }

  console.log(`✅ ${lavadoProducts.length} productos de lavado creados`);

  // ─── ARTÍCULOS DE BLOG ───────────────────────────────────────────────────────
  const blogPosts = [
    {
      title: 'Cómo elegir la lavadora perfecta para tu hogar en 2024',
      slug: 'como-elegir-lavadora-perfecta-hogar-2024',
      excerpt: 'Guía completa con todo lo que necesitas saber antes de comprar una lavadora: capacidad, eficiencia energética, rpm y funciones especiales.',
      content: `# Cómo elegir la lavadora perfecta para tu hogar en 2024\n\nElegir una lavadora puede parecer sencillo, pero hay muchos factores a considerar...\n\n## Capacidad\nPara 1-2 personas: 6-7 kg. Para 3-4 personas: 8-9 kg. Para familias grandes: 10-12 kg.\n\n## Eficiencia energética\nBusca siempre la etiqueta A o superior para ahorrar en electricidad.\n\n## Revoluciones por minuto (rpm)\nCuantas más rpm, más centrifugado y ropa menos húmeda al sacar.\n`,
      coverImage: '/images/blog/guia-lavadora-2024.jpg',
      isPublished: true,
      publishedAt: new Date('2024-01-15'),
      metaTitle: 'Cómo elegir la lavadora perfecta para tu hogar en 2024 | J. Capi Blog',
      metaDescription: 'Guía completa para elegir lavadora: capacidad, eficiencia energética, rpm. Todo lo que necesitas saber antes de comprar.',
    },
    {
      title: 'Las mejores secadoras de bomba de calor: comparativa 2024',
      slug: 'mejores-secadoras-bomba-calor-comparativa-2024',
      excerpt: 'Analizamos las secadoras de bomba de calor más populares del mercado para ayudarte a elegir la mejor opción precio-calidad.',
      content: `# Las mejores secadoras de bomba de calor: comparativa 2024\n\nLas secadoras de bomba de calor son la opción más eficiente del mercado...\n\n## ¿Por qué bomba de calor?\nAhorran hasta un 50% de energía respecto a las secadoras de condensación convencionales.\n`,
      coverImage: '/images/blog/comparativa-secadoras-2024.jpg',
      isPublished: true,
      publishedAt: new Date('2024-02-20'),
      metaTitle: 'Mejores secadoras bomba de calor 2024 | J. Capi Blog',
      metaDescription: 'Comparativa de las mejores secadoras de bomba de calor 2024. Samsung, LG, Bosch y Siemens analizadas.',
    },
    {
      title: 'Eficiencia energética en electrodomésticos: guía de etiquetas 2024',
      slug: 'eficiencia-energetica-electrodomesticos-guia-etiquetas-2024',
      excerpt: 'Todo sobre las nuevas etiquetas energéticas europeas A-G y cómo influyen en el consumo y ahorro de tus electrodomésticos.',
      content: `# Eficiencia energética en electrodomésticos: guía de etiquetas 2024\n\nDesde 2021, las etiquetas energéticas europeas han cambiado...\n\n## Nueva escala A-G\nLa nueva etiqueta va de A (más eficiente) a G (menos eficiente).\n`,
      coverImage: '/images/blog/etiquetas-energeticas-2024.jpg',
      isPublished: true,
      publishedAt: new Date('2024-03-10'),
      metaTitle: 'Guía etiquetas energéticas electrodomésticos 2024 | J. Capi Blog',
      metaDescription: 'Entiende las nuevas etiquetas energéticas europeas A-G y elige electrodomésticos que ahorren energía.',
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log('✅ Artículos de blog creados');
  console.log('\n🎉 Seed completado correctamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
