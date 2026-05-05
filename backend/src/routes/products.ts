import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /api/products ────────────────────────────────────────────────────────
// Parámetros: page, limit, category, brand, minPrice, maxPrice, energy, sort, q
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      brand,
      minPrice,
      maxPrice,
      energy,
      sort = 'newest',
      q,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(48, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ── Construcción del where ─────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isActive: true };

    // Búsqueda por texto
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim(), mode: 'insensitive' } },
        { shortDesc: { contains: q.trim(), mode: 'insensitive' } },
        { description: { contains: q.trim(), mode: 'insensitive' } },
        { sku: { contains: q.trim(), mode: 'insensitive' } },
        { brand: { name: { contains: q.trim(), mode: 'insensitive' } } },
      ];
    }

    // Filtro por categoría (incluye subcategorías)
    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        include: { children: true },
      });
      if (cat) {
        const categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    // Filtro por marca
    if (brand) {
      const brandRecord = await prisma.brand.findUnique({ where: { slug: brand } });
      if (brandRecord) where.brandId = brandRecord.id;
    }

    // Filtros de precio
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Eficiencia energética
    if (energy) {
      where.energyRating = { in: energy.split(',') };
    }

    // ── Ordenación ────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'featured') orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];

    // ── Consultas en paralelo ─────────────────────────────────────────────────
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              parent: { select: { id: true, name: true, slug: true } },
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error GET /products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ─── GET /api/products/featured ───────────────────────────────────────────────
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    res.json({ data: products });
  } catch (error) {
    console.error('Error GET /products/featured:', error);
    res.status(500).json({ error: 'Error al obtener productos destacados' });
  }
});

// ─── GET /api/products/:slug ──────────────────────────────────────────────────
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: {
          include: {
            parent: {
              include: {
                parent: true,
              },
            },
          },
        },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Productos relacionados (misma categoría, distinto slug)
    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        slug: { not: slug },
      },
      take: 4,
      orderBy: { isFeatured: 'desc' },
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    res.json({ data: product, related });
  } catch (error) {
    console.error('Error GET /products/:slug:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

export default router;
