import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /api/categories ─────────────────────────────────────────────────────
// Retorna árbol completo de categorías con subcategorías
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { products: { where: { isActive: true } } } },
          },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    res.json({ data: categories });
  } catch (error) {
    console.error('Error GET /categories:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// ─── GET /api/categories/:slug ────────────────────────────────────────────────
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { products: { where: { isActive: true } } } },
          },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ data: category });
  } catch (error) {
    console.error('Error GET /categories/:slug:', error);
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
});

export default router;
