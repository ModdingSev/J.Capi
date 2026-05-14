import cron from 'node-cron';
import prisma from '../lib/prisma';

/**
 * Servicio de sincronización con ClassicGes 6
 * 
 * La sincronización real funciona así:
 *   1. Un agente local (sync-agent.js) se ejecuta en el PC del cliente
 *      mediante el Programador de Tareas de Windows.
 *   2. Ese agente lee el archivo .DBF de ClassicGes y envía los datos
 *      al endpoint POST /api/sync con autenticación por API Key.
 *   3. El endpoint (routes/sync.ts) hace upsert de cada producto.
 *
 * Este cron NO hace la sincronización (eso lo hace el agente externo).
 * Su función es:
 *   - Registrar periódicamente un resumen de stock en los logs.
 *   - Detectar productos desactualizados (no sincronizados recientemente).
 *   - Servir de punto de extensión para futuras tareas programadas.
 */

export function startSyncCron() {
  // Se ejecuta cada hora en punto (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    console.log('[SYNC] Ejecutando comprobación periódica de stock...');
    try {
      // Resumen general de inventario
      const totalProducts = await prisma.product.count({ where: { isActive: true } });
      const inStock = await prisma.product.count({ where: { isActive: true, stock: { gt: 0 } } });
      const outOfStock = totalProducts - inStock;

      console.log(`[SYNC] Inventario actual: ${totalProducts} productos activos | ${inStock} con stock | ${outOfStock} sin stock`);

      // Detectar productos no actualizados en las últimas 48h (posible fallo del agente)
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const stale = await prisma.product.count({
        where: {
          isActive: true,
          externalSyncId: { not: null },
          updatedAt: { lt: cutoff },
        },
      });

      if (stale > 0) {
        console.warn(`[SYNC] ⚠️ ${stale} productos con externalSyncId no se han actualizado en 48h. Verificar que el agente de ClassicGes esté funcionando.`);
      } else {
        console.log('[SYNC] ✅ Todos los productos sincronizados están al día.');
      }

    } catch (error) {
      console.error('[SYNC] Error en comprobación periódica:', error);
    }
  });

  console.log('⏰ Comprobación periódica de stock programada (cada 1 hora)');
  console.log('📡 La sincronización real la realiza el agente local de ClassicGes vía POST /api/sync');
}
