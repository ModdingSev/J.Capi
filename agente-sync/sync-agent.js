/**
 * ============================================================================
 * AGENTE DE SINCRONIZACIÓN: ClassicGes 6 (.DBF) → jcapi API
 * ============================================================================
 * 
 * Este script lee la base de datos de ClassicGes (archivos .dbf de Visual FoxPro)
 * y envía los productos al endpoint /api/sync del backend de jcapi.
 *
 * ESTRUCTURA REAL DE DATOS (según listado_jcapi.xlsx del cliente):
 * ─────────────────────────────────────────────────────────────────
 *   Campo ClassicGes    →  Campo jcapi        Ejemplo
 *   ─────────────────────────────────────────────────────────────
 *   Código (col B)      →  sku                "CT30", "BAT1200TI"
 *   Nombre (col D)      →  name               "ALMOHADILLA ELECTRICA 100W 60x41 cm"
 *   Ref. proveed (col E)→  supplierRef/EAN    "8421078032229" (código de barras)
 *   Familia (col F)     →  family (→ category)"CUIDADO PERSONAL", "BATIDORA DE VASO"
 *   Existencias (col G) →  stock              "3,0" (string con coma decimal)
 *   PVP (col J)         →  priceBase          "33,02" (sin IVA, coma decimal)
 *   PVP IVA INC (col L) →  price              "39,95" (con IVA, coma decimal)
 *
 * NOTAS IMPORTANTES:
 *   - Hay 3.722 productos y 65 familias únicas
 *   - ~1.620 tienen stock > 0
 *   - ~565 no tienen referencia de proveedor
 *   - Las existencias y precios vienen como strings con coma decimal ("3,0", "33,02")
 *   - Existen filas sin código (basura) que debemos filtrar
 *   - Hay familias duplicadas con distinta capitalización ("COMBI BLANCO" vs "Combi BLANCO")
 *
 * ============================================================================
 */

require('dotenv').config();
const { DBFFile } = require('dbffile');
const axios = require('axios');

// ═══════════════════════════════════════════════════════════════════════════════
// TODO: [CLIENTE] - CONFIGURAR ANTES DE DESPLEGAR EN EL PC DEL CLIENTE
// ═══════════════════════════════════════════════════════════════════════════════

// Ruta al archivo .DBF de artículos de ClassicGes 6
// NOTA: ClassicGes suele guardar los datos en una carpeta tipo:
//   C:\ClassicGes6\Datos\ARTICULOS.DBF  o  C:\ClassicGes\Empresa\ARTICUL.DBF
// TODO: [CLIENTE] - Confirmar ruta exacta con el técnico del cliente
const DBF_FILE_PATH = process.env.DBF_FILE_PATH || 'C:\\ClassicGes6\\Datos\\ARTICULOS.DBF';

// URL del endpoint de sincronización en producción
// TODO: [CLIENTE] - Cambiar a la URL real de producción cuando se despliegue
const API_URL = process.env.API_URL || 'http://localhost:4000/api/sync';

// API Key compartida entre este agente y el servidor
// TODO: [CLIENTE] - Cambiar a una clave segura real en producción
const SYNC_API_KEY = process.env.SYNC_API_KEY || 'secreto_super_seguro_123';

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEO DE CAMPOS DBF → API
// ═══════════════════════════════════════════════════════════════════════════════
// TODO: [CLIENTE] - Los nombres de campo del .DBF pueden variar ligeramente
// respecto a los del Excel exportado. Ejecutar una primera lectura de prueba
// para verificar los nombres reales. Los campos típicos de ClassicGes 6 son:
//
//   DBF Field    →  Uso en el script
//   ───────────────────────────────────
//   CODIGO       →  SKU del producto
//   NOMBRE       →  Nombre / Descripción
//   REFPROVED    →  Referencia proveedor (EAN/código de barras)
//   FAMILIA      →  Familia / Categoría
//   EXISTENCIA   →  Stock actual (número)
//   PVP          →  Precio sin IVA
//   PVPIVA       →  Precio con IVA incluido
//
// Si los campos no coinciden, ajustar la función mapRecord() de abajo.

const FIELD_MAP = {
    sku:         process.env.DBF_FIELD_SKU         || 'CODIGO',
    name:        process.env.DBF_FIELD_NAME        || 'NOMBRE',
    supplierRef: process.env.DBF_FIELD_SUPPLIER    || 'REFPROVED',
    family:      process.env.DBF_FIELD_FAMILY      || 'FAMILIA',
    stock:       process.env.DBF_FIELD_STOCK        || 'EXISTENCIA',
    priceBase:   process.env.DBF_FIELD_PVP         || 'PVP',
    priceIva:    process.env.DBF_FIELD_PVP_IVA     || 'PVPIVA',
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parsea un número que puede venir en formato español (coma decimal)
 * Ej: "33,02" → 33.02, "3,0" → 3, "512,40" → 512.40
 */
function parseSpanishNumber(value) {
    if (value === null || value === undefined) return 0;
    const str = String(value).trim().replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

/**
 * Normaliza el nombre de familia a formato Title Case limpio
 * Ej: "COMBI BLANCO" → "Combi Blanco", "BATIDORA DE VASO" → "Batidora De Vaso"
 */
function normalizeFamily(family) {
    if (!family) return 'Sin Clasificar';
    return String(family).trim().toUpperCase(); // Normalizamos todo a MAYÚSCULAS para evitar duplicados
}

/**
 * Mapea un registro del DBF al formato esperado por la API
 */
function mapRecord(record) {
    const sku = record[FIELD_MAP.sku];
    if (!sku || String(sku).trim() === '') return null; // Filtrar filas sin código

    return {
        sku:         String(sku).trim(),
        name:        String(record[FIELD_MAP.name] || '').trim(),
        supplierRef: String(record[FIELD_MAP.supplierRef] || '').trim() || null,
        family:      normalizeFamily(record[FIELD_MAP.family]),
        stock:       Math.max(0, Math.floor(parseSpanishNumber(record[FIELD_MAP.stock]))),
        priceBase:   parseSpanishNumber(record[FIELD_MAP.priceBase]),
        price:       parseSpanishNumber(record[FIELD_MAP.priceIva]),
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

async function syncProducts() {
    const startTime = Date.now();
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[${new Date().toISOString()}] SYNC: Iniciando sincronización...`);
    console.log(`${'═'.repeat(60)}`);

    try {
        // ── 1. LEER ARCHIVO .DBF ─────────────────────────────────────────────
        console.log(`\n📂 Leyendo archivo: ${DBF_FILE_PATH}`);
        
        // ClassicGes 6 usa codificación Windows-1252 (CP1252) para caracteres españoles
        const dbf = await DBFFile.open(DBF_FILE_PATH, { encoding: 'win1252' });
        
        console.log(`   Campos encontrados en el DBF: ${dbf.fields.map(f => f.name).join(', ')}`);
        console.log(`   Total registros en archivo: ${dbf.recordCount}`);
        
        const records = await dbf.readRecords(dbf.recordCount);

        // ── 2. TRANSFORMAR Y FILTRAR ─────────────────────────────────────────
        console.log(`\n🔄 Mapeando registros...`);
        
        const mappedProducts = [];
        let skipped = 0;

        for (const record of records) {
            const mapped = mapRecord(record);
            if (mapped) {
                mappedProducts.push(mapped);
            } else {
                skipped++;
            }
        }

        console.log(`   ✅ Productos válidos: ${mappedProducts.length}`);
        console.log(`   ⏭️  Filas descartadas (sin código): ${skipped}`);
        
        const withStock = mappedProducts.filter(p => p.stock > 0).length;
        console.log(`   📦 Con stock > 0: ${withStock}`);

        // Resumen de familias encontradas
        const families = [...new Set(mappedProducts.map(p => p.family))];
        console.log(`   📁 Familias únicas: ${families.length}`);

        if (mappedProducts.length === 0) {
            console.log('\n⚠️  No hay productos para enviar. Abortando.');
            return;
        }

        // ── 3. ENVIAR POR LOTES ──────────────────────────────────────────────
        // Enviamos en lotes de 500 para no sobrecargar el servidor
        const BATCH_SIZE = 500;
        const totalBatches = Math.ceil(mappedProducts.length / BATCH_SIZE);
        
        console.log(`\n📤 Enviando ${mappedProducts.length} productos en ${totalBatches} lotes...`);

        let totalProcessed = 0;
        let totalErrors = 0;

        for (let i = 0; i < mappedProducts.length; i += BATCH_SIZE) {
            const batch = mappedProducts.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            
            try {
                const response = await axios.post(API_URL, {
                    products: batch
                }, {
                    headers: {
                        'Authorization': `Bearer ${SYNC_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000 // 60 segundos por lote
                });

                const { results } = response.data;
                totalProcessed += results?.updated || batch.length;
                totalErrors += results?.errors || 0;
                
                console.log(`   Lote ${batchNum}/${totalBatches}: ${batch.length} productos → OK`);
            } catch (err) {
                console.error(`   Lote ${batchNum}/${totalBatches}: ERROR`);
                if (err.response) {
                    console.error(`      HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
                } else {
                    console.error(`      ${err.message}`);
                }
                totalErrors += batch.length;
            }
        }

        // ── 4. RESUMEN FINAL ─────────────────────────────────────────────────
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`✅ SINCRONIZACIÓN COMPLETADA en ${elapsed}s`);
        console.log(`   Procesados: ${totalProcessed} | Errores: ${totalErrors}`);
        console.log(`${'═'.repeat(60)}\n`);

    } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.error(`\n❌ ERROR FATAL (${elapsed}s):`);
        if (error.code === 'ENOENT') {
            console.error(`   No se encontró el archivo: ${DBF_FILE_PATH}`);
            console.error(`   Verifique la ruta del archivo .DBF de ClassicGes.`);
        } else if (error.response) {
            console.error(`   HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`   ${error.message}`);
        }
        process.exit(1);
    }
}

// ── EJECUTAR ─────────────────────────────────────────────────────────────────
syncProducts();
