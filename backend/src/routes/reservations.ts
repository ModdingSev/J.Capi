import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/reservations - Crear una nueva reserva
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, notes } = req.body;
    
    if (!customerName || !customerPhone || !items || !items.length) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (nombre, teléfono y al menos 1 producto)' });
    }

    let total = 0;
    const reservationItemsData = [];
    
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      
      const price = product.price;
      total += Number(price) * item.quantity;
      
      reservationItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: price
      });
    }

    if (reservationItemsData.length === 0) {
      return res.status(400).json({ error: 'No se encontraron productos válidos en la reserva' });
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        notes,
        total,
        items: {
          create: reservationItemsData
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error: any) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
