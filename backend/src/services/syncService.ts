import cron from 'node-cron';
import prisma from '../lib/prisma';

// MOCK: Función que simula llamar a la API de Classy G para obtener el stock
async function fetchStockFromClassyG() {
  console.log('[SYNC] Simulando llamada a la API de Classy G para obtener stock...');
  // Devuelve un mapa de externalSyncId a un número aleatorio de stock (0-20)
  return {
    'classy-1': Math.floor(Math.random() * 20),
    'classy-2': Math.floor(Math.random() * 20),
    // ...
  };
}

export function startSyncCron() {
  // Se ejecuta cada hora en punto (0 * * * *)
  // Para pruebas, podemos ponerlo cada 1 minuto: * * * * *
  cron.schedule('0 * * * *', async () => {
    console.log('[SYNC] Iniciando sincronización de stock con Classy G...');
    try {
      // 1. Obtener datos de Classy G
      const classyGData = await fetchStockFromClassyG();

      // 2. Actualizar nuestra base de datos
      const products = await prisma.product.findMany({
        where: { externalSyncId: { not: null } }
      });

      let updatedCount = 0;
      for (const product of products) {
        if (product.externalSyncId && classyGData[product.externalSyncId as keyof typeof classyGData] !== undefined) {
          const newStock = classyGData[product.externalSyncId as keyof typeof classyGData];
          if (product.stock !== newStock) {
            await prisma.product.update({
              where: { id: product.id },
              data: { stock: newStock }
            });
            updatedCount++;
          }
        }
      }
      console.log(`[SYNC] Sincronización completada. ${updatedCount} productos actualizados.`);
    } catch (error) {
      console.error('[SYNC] Error sincronizando stock:', error);
    }
  });
  
  console.log('⏰ Servicio de sincronización programado (Cada 1 hora)');
}
