import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /api/blog ────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '9' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(24, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = { isPublished: true };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({
      data: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error GET /blog:', error);
    res.status(500).json({ error: 'Error al obtener artículos del blog' });
  }
});

// ─── GET /api/blog/:slug ──────────────────────────────────────────────────────
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug, isPublished: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    // Artículos relacionados (los más recientes distintos al actual)
    const related = await prisma.blogPost.findMany({
      where: { isPublished: true, slug: { not: slug } },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
      },
    });

    res.json({ data: post, related });
  } catch (error) {
    console.error('Error GET /blog/:slug:', error);
    res.status(500).json({ error: 'Error al obtener el artículo' });
  }
});

export default router;
