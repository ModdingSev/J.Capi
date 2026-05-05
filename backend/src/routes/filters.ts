import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /api/filters ─────────────────────────────────────────────────────────
// Retorna los filtros disponibles para una categoría dada
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query as { category?: string };

    // Construir condición de categoría
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let categoryWhere: any = {};

    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        include: { children: true },
      });
      if (cat) {
        const ids = [cat.id, ...cat.children.map((c: { id: number }) => c.id)];
        categoryWhere = { categoryId: { in: ids } };
      }
    }

    const where = { isActive: true, ...categoryWhere };

    // Obtener datos de filtros en paralelo
    const [priceAgg, brands, energyRatings] = await Promise.all([
      // Precio min/max
      prisma.product.aggregate({
        where,
        _min: { price: true },
        _max: { price: true },
      }),
      // Marcas disponibles
      prisma.brand.findMany({
        where: { products: { some: where } },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      }),
      // Etiquetas energéticas disponibles
      prisma.product.groupBy({
        by: ['energyRating'],
        where: { ...where, energyRating: { not: null } },
        _count: { energyRating: true },
        orderBy: { energyRating: 'asc' },
      }),
    ]);

    const energyOrder = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const sortedEnergy = energyRatings
      .filter((e) => e.energyRating)
      .sort(
        (a, b) =>
          energyOrder.indexOf(a.energyRating!) -
          energyOrder.indexOf(b.energyRating!),
      );

    res.json({
      price: {
        min: Number(priceAgg._min.price) || 0,
        max: Number(priceAgg._max.price) || 9999,
      },
      brands,
      energyRatings: sortedEnergy.map((e) => ({
        value: e.energyRating,
        count: e._count.energyRating,
      })),
    });
  } catch (error) {
    console.error('Error GET /filters:', error);
    res.status(500).json({ error: 'Error al obtener filtros' });
  }
});

export default router;
