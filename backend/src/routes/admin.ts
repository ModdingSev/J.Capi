import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Middleware de autenticación simple para rutas de admin
const requireAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === adminPassword) {
    res.json({ success: true, token: adminPassword });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

// GET /api/admin/reservations
router.get('/reservations', requireAdmin, async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// PUT /api/admin/reservations/:id/complete
router.put('/reservations/:id/complete', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Obtener la reserva
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(id) },
      include: { items: { include: { product: true } } }
    });

    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (reservation.status === 'COMPLETED') return res.status(400).json({ error: 'La reserva ya estaba completada' });

    // 2. Marcar como completada
    const updated = await prisma.reservation.update({
      where: { id: Number(id) },
      data: { status: 'COMPLETED' }
    });

    // 3. Descontar stock localmente
    // El stock real lo gestiona ClassicGes. Aquí actualizamos la web para reflejarlo al instante.
    // En la próxima sincronización del agente local, el stock se sobreescribirá con el valor real de ClassicGes.
    for (const item of reservation.items) {
      if (item.product) {
        console.log(`[STOCK] Restando ${item.quantity}x ${item.product.name} (SKU: ${item.product.sku || 'N/A'}) del stock local`);
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: Math.max(0, item.product.stock - item.quantity) }
        });
      }
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error al completar reserva' });
  }
});

export default router;
