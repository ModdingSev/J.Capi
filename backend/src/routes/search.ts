import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /api/search?q=texto ──────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q = '', limit = '8' } = req.query as Record<string, string>;

    if (!q.trim()) {
      return res.json({ products: [], categories: [] });
    }

    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const term = q.trim();

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { shortDesc: { contains: term, mode: 'insensitive' } },
            { brand: { name: { contains: term, mode: 'insensitive' } } },
            { sku: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limitNum,
        orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          brand: { select: { name: true } },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, alt: true },
          },
        },
      }),
      prisma.category.findMany({
        where: { name: { contains: term, mode: 'insensitive' } },
        take: 4,
        select: { id: true, name: true, slug: true, parentId: true },
      }),
    ]);

    res.json({ products, categories });
  } catch (error) {
    console.error('Error GET /search:', error);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

export default router;
