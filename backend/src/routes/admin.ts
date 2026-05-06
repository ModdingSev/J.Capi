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

    // 3. Simular descuento de stock en Classy G y en local
    // (En un futuro aquí se haría la llamada real a la API de Classy G usando product.externalSyncId)
    for (const item of reservation.items) {
      if (item.product) {
        console.log(`[SYNC] Restando ${item.quantity} del producto ${item.product.name} (SyncID: ${item.product.externalSyncId || 'N/A'}) en Classy G...`);
        // Actualizamos nuestro propio stock también para reflejarlo en la web al instante si queremos
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
