import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import slugify from 'slugify';

const router = Router();

// TODO: [CLIENTE] - En producción, usar una variable de entorno real y segura
const SYNC_API_KEY = process.env.SYNC_API_KEY || 'secreto_super_seguro_123';

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEO DE FAMILIAS DE CLASSICGES → CATEGORÍAS DE JCAPI
// ═══════════════════════════════════════════════════════════════════════════════
// Las familias de ClassicGes se agrupan en las categorías principales del schema.
// Esto permite que los 65 nombres de familia se mapeen a nuestras categorías
// jerárquicas (Frigoríficos, Lavado, Cocción, etc.)

const FAMILY_TO_PARENT_CATEGORY: Record<string, string> = {
  // ── Frío ──
  'FRIGO':              'frigorificos',
  'COMBI BLANCO':       'frigorificos',
  'COMBI INOX':         'frigorificos',
  'COMBI NEGRO':        'frigorificos',
  'COMBI INTEGRABLE':   'frigorificos',
  'SIDE BY SIDE':       'frigorificos',
  'CONGELADOR':         'congeladores',
  // ── Lavado ──
  'LAVADORA 5KG':       'lavado',
  'LAVADORA 6KG':       'lavado',
  'LAVADORA 7K':        'lavado',
  'LAVADORA 8K':        'lavado',
  'LAVADORA 9KG':       'lavado',
  'LAVADORA 10K':       'lavado',
  'LAVADORA 12KG':      'lavado',
  'LAVADORA 13KG':      'lavado',
  'LAVADORA 17KG':      'lavado',
  'LAVADORA 20KG':      'lavado',
  'LAVADORA C/S':       'lavado',
  'LAVASECADORA':       'lavado',
  'SECADORA':           'lavado',
  // ── Lavavajillas ──
  'LAVAVAJILLAS BLANCO':     'lavavajillas',
  'LAVAVAJILLAS INOX':       'lavavajillas',
  'LAVAVAJILLAS INTEGRABLE': 'lavavajillas',
  // ── Cocción ──
  'VITROCERAMICA':      'coccion',
  'VITRO INDUCCION':    'coccion',
  'VITROGAS':           'coccion',
  'ENCIMERA DE GAS':    'coccion',
  'CAMPANAS':           'coccion',
  // ── Hornos/Microondas ──
  'MICROONDAS':         'microondas',
  // ── Pequeño electrodoméstico (cocina) ──
  'BATIDORA DE VASO':      'pequeno-electrodomestico',
  'BATIDORA VARILLA':      'pequeno-electrodomestico',
  'CAFETERAS':             'pequeno-electrodomestico',
  'CAFETERA ALUMINIO':     'pequeno-electrodomestico',
  'CAFETERA INOX':         'pequeno-electrodomestico',
  'EXPRIMIDOR':            'pequeno-electrodomestico',
  'FREIDORA':              'pequeno-electrodomestico',
  'LICUADORA':             'pequeno-electrodomestico',
  'TOSTADOR':              'pequeno-electrodomestico',
  'SANDWICH':              'pequeno-electrodomestico',
  'AMASADORA':             'pequeno-electrodomestico',
  'ARROCERA':              'pequeno-electrodomestico',
  'CREPERA':               'pequeno-electrodomestico',
  'PICADORA':              'pequeno-electrodomestico',
  'MOLINILLO':             'pequeno-electrodomestico',
  'CORTAFIAMBRE':          'pequeno-electrodomestico',
  'ENVASADORA':            'pequeno-electrodomestico',
  'PLANCHA  ASAR':         'pequeno-electrodomestico',
  // ── Cuidado personal ──
  'CUIDADO PERSONAL':      'cuidado-personal',
  'SECADOR DE PELO':       'cuidado-personal',
  'AFEITADORA':            'cuidado-personal',
  'PLANCHA Y TENECILLA':   'cuidado-personal',
  // ── Hogar ──
  'PLANCHADO':             'hogar',
  'VENTILADOR':            'hogar',
  'VENTILADOR TECHO':      'hogar',
  'PURIFICADOR':           'hogar',
  'MATA INSECTOS':         'hogar',
  'TERMO':                 'hogar',
  'CARRO COMPRA':          'hogar',
  // ── Menaje ──
  'MENAJE':                'menaje',
  'UTENCILIOS DE COCINA':  'menaje',
  'CUBIERTOS':             'menaje',
  'OLLA PRESION':          'menaje',
  'OLLAS':                 'menaje',
  // ── Otros ──
  'PANTALLA':              'otros',
};

/**
 * Dado un nombre de familia de ClassicGes, devuelve el slug de la categoría padre
 * y crea la subcategoría (familia) si no existe.
 */
async function resolveCategory(familyName: string): Promise<number> {
  const normalizedFamily = familyName.toUpperCase().trim();
  const parentSlug = FAMILY_TO_PARENT_CATEGORY[normalizedFamily] || 'sin-clasificar';

  // Buscar o crear la categoría padre
  let parentCategory = await prisma.category.findUnique({ where: { slug: parentSlug } });
  if (!parentCategory) {
    parentCategory = await prisma.category.create({
      data: {
        name: parentSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: parentSlug,
      },
    });
  }

  // Buscar o crear la subcategoría (familia original de ClassicGes)
  const familySlug = slugify(familyName, { lower: true, strict: true });
  let subCategory = await prisma.category.findUnique({ where: { slug: familySlug } });
  if (!subCategory) {
    subCategory = await prisma.category.create({
      data: {
        name: familyName,
        slug: familySlug,
        parentId: parentCategory.id,
      },
    });
  }

  return subCategory.id;
}

// Cache para evitar resolver la misma familia repetidamente
const categoryCache = new Map<string, number>();

async function getCategoryId(familyName: string): Promise<number> {
  const key = familyName.toUpperCase().trim();
  if (categoryCache.has(key)) {
    return categoryCache.get(key)!;
  }
  const id = await resolveCategory(familyName);
  categoryCache.set(key, id);
  return id;
}

// ─── Brave Image Search: imagen por EAN ──────────────────────────────────
// 2000 búsquedas/mes gratis — api.search.brave.com
const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY;

async function fetchImageFromEAN(ean: string): Promise<string | null> {
  if (!BRAVE_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/images/search?q=${encodeURIComponent(ean)}&count=1`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data: any = await res.json();
    const image = data.results?.[0]?.thumbnail?.src ?? data.results?.[0]?.url ?? null;
    if (image) console.log(`[SYNC][IMG] EAN ${ean} → ${image}`);
    return image;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/sync — Endpoint de sincronización
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/', async (req: Request, res: Response) => {
  try {
    // 1. Validación de API Key
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${SYNC_API_KEY}`) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Formato inválido. Se espera { products: [...] }' });
    }

    console.log(`[SYNC] Recibidos ${products.length} productos para procesar`);

    // Buscar o crear marca genérica para productos de ClassicGes
    // (ClassicGes no exporta marca, solo familia/categoría)
    let defaultBrand = await prisma.brand.findUnique({ where: { slug: 'generica' } });
    if (!defaultBrand) {
      defaultBrand = await prisma.brand.create({
        data: { name: 'Genérica', slug: 'generica' },
      });
    }

    const results = { created: 0, updated: 0, errors: 0, images: 0 };
    let imageLookups = 0;
    const IMAGE_LOOKUP_LIMIT = 90; // margen respecto al límite diario de 100

    for (const prod of products) {
      try {
        const { sku, name, supplierRef, family, stock, priceBase, price } = prod;
        if (!sku || !name) continue;

        // Resolver categoría basándose en la familia de ClassicGes
        const categoryId = await getCategoryId(family || 'Sin Clasificar');

        // Generar slug único
        const slug = slugify(`${name}-${sku}`, { lower: true, strict: true });

        // Precio final: preferimos PVP IVA INC. Si no viene, usamos PVP base
        const finalPrice = price > 0 ? price : priceBase;

        const existing = await prisma.product.findUnique({ where: { sku } });

        if (existing) {
          // ── ACTUALIZAR: Solo stock, precios y referencia ──
          await prisma.product.update({
            where: { sku },
            data: {
              stock: stock ?? 0,
              price: finalPrice > 0 ? String(finalPrice) : existing.price,
              comparePrice: priceBase > 0 && price > priceBase ? String(priceBase) : undefined,
              externalSyncId: supplierRef || existing.externalSyncId,
            },
          });
          results.updated++;
        } else {
          // ── CREAR: Producto nuevo desde ClassicGes ──
          const newProduct = await prisma.product.create({
            data: {
              sku,
              name,
              slug,
              price: String(finalPrice || 0),
              comparePrice: priceBase > 0 && price > priceBase ? String(priceBase) : null,
              stock: stock ?? 0,
              categoryId,
              brandId: defaultBrand.id,
              externalSyncId: supplierRef || null,
              isActive: true,
              isFeatured: false,
              isNew: false,
            },
          });
          results.created++;

          // Buscar imagen en UPCitemdb si tiene EAN y no hemos agotado el límite diario
          if (supplierRef && imageLookups < IMAGE_LOOKUP_LIMIT) {
            imageLookups++;
            const imageUrl = await fetchImageFromEAN(String(supplierRef));
            if (imageUrl) {
              await prisma.productImage.create({
                data: { productId: newProduct.id, url: imageUrl, isPrimary: true, sortOrder: 0 },
              });
              results.images++;
            }
          }
        }
      } catch (err: any) {
        // Si es error de slug duplicado, intentar con sufijo aleatorio
        if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
          try {
            const uniqueSlug = slugify(`${prod.name}-${prod.sku}-${Date.now()}`, { lower: true, strict: true });
            const categoryId = await getCategoryId(prod.family || 'Sin Clasificar');
            const finalPrice = prod.price > 0 ? prod.price : prod.priceBase;

            await prisma.product.create({
              data: {
                sku: prod.sku,
                name: prod.name,
                slug: uniqueSlug,
                price: String(finalPrice || 0),
                stock: prod.stock ?? 0,
                categoryId,
                brandId: defaultBrand.id,
                externalSyncId: prod.supplierRef || null,
                isActive: true,
                isFeatured: false,
                isNew: false,
              },
            });
            results.created++;
            continue;
          } catch {
            // Si sigue fallando, registrar como error
          }
        }
        console.error(`[SYNC] Error procesando SKU ${prod.sku}: ${err.message}`);
        results.errors++;
      }
    }

    console.log(`[SYNC] Completado: ${results.created} creados, ${results.updated} actualizados, ${results.images} imágenes, ${results.errors} errores`);

    res.json({
      success: true,
      message: 'Sincronización completada',
      results,
    });
  } catch (error) {
    console.error('[SYNC] Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
