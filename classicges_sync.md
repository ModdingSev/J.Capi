# Sincronización ClassicGes 6 → jcapi

## Resumen de la Arquitectura

```
┌──────────────────────────┐        HTTPS POST         ┌──────────────────────────┐
│   PC LOCAL DEL CLIENTE   │  ─────────────────────►   │   SERVIDOR WEB (jcapi)   │
│                          │   /api/sync               │                          │
│  ClassicGes 6            │   Bearer API_KEY          │  Express + Prisma        │
│  └─ ARTICULOS.DBF        │   { products: [...] }     │  └─ PostgreSQL           │
│                          │                           │                          │
│  Node.js Agent           │                           │  Endpoint /api/sync      │
│  └─ sync-agent.js        │                           │  └─ Upsert por SKU       │
│  └─ Programador Tareas   │                           │  └─ Mapeo Familias→Cat   │
└──────────────────────────┘                           └──────────────────────────┘
```

---

## Datos Reales del Cliente (listado_jcapi.xlsx)

| Dato                  | Valor                                  |
|-----------------------|----------------------------------------|
| **Total productos**   | 3.722 artículos                        |
| **Con stock > 0**     | 1.620 (~43%)                           |
| **Familias únicas**   | 65 categorías                          |
| **Sin ref. proveedor**| 565 artículos (~15%)                   |
| **Formato numérico**  | Coma decimal española ("33,02")        |
| **Codificación**      | Windows-1252 (CP1252)                  |

### Estructura de campos del Excel/DBF

| Campo ClassicGes   | Columna Excel | Campo en API   | Ejemplo                              |
|--------------------|---------------|----------------|--------------------------------------|
| Código             | B             | `sku`          | `CT30`, `BAT1200TI`                 |
| Nombre             | D             | `name`         | `ALMOHADILLA ELECTRICA 100W 60x41 cm` |
| Ref. proveed.      | E             | `supplierRef`  | `8421078032229` (EAN/barcode)        |
| Familia            | F             | `family`       | `CUIDADO PERSONAL`, `COMBI BLANCO`  |
| Existencias        | G             | `stock`        | `3,0` → 3                           |
| PVP                | J             | `priceBase`    | `33,02` → 33.02 (sin IVA)           |
| PVP IVA INC.       | L             | `price`        | `39,95` → 39.95 (con IVA)           |

### Las 65 Familias y su Mapeo a Categorías

| Categoría jcapi                | Familias de ClassicGes                                                              |
|--------------------------------|------------------------------------------------------------------------------------- |
| **Frigoríficos**               | FRIGO, COMBI BLANCO, COMBI INOX, COMBI NEGRO, COMBI INTEGRABLE, SIDE BY SIDE        |
| **Congeladores**               | CONGELADOR                                                                           |
| **Lavado**                     | LAVADORA 5-20KG, LAVADORA C/S, LAVASECADORA, SECADORA                               |
| **Lavavajillas**               | LAVAVAJILLAS BLANCO, INOX, INTEGRABLE                                                |
| **Cocción**                    | VITROCERAMICA, VITRO INDUCCION, VITROGAS, ENCIMERA DE GAS, CAMPANAS                 |
| **Microondas**                 | MICROONDAS                                                                           |
| **Pequeño Electrodoméstico**   | BATIDORA DE VASO/VARILLA, CAFETERAS, EXPRIMIDOR, FREIDORA, TOSTADOR, SANDWICH, etc. |
| **Cuidado Personal**           | CUIDADO PERSONAL, SECADOR DE PELO, AFEITADORA, PLANCHA Y TENECILLA                  |
| **Hogar**                      | PLANCHADO, VENTILADOR, VENTILADOR TECHO, PURIFICADOR, TERMO, CARRO COMPRA, etc.     |
| **Menaje**                     | MENAJE, UTENCILIOS DE COCINA, CUBIERTOS, OLLA PRESION, OLLAS                         |
| **Otros**                      | PANTALLA                                                                             |

---

## Archivos Implementados

### Backend (servidor web)

- **`backend/src/routes/sync.ts`** — Endpoint POST /api/sync
  - Valida API Key
  - Resuelve familias → categorías jerárquicas (con cache)
  - Upsert por SKU: si existe actualiza stock/precio, si no crea el producto
  - Crea subcategorías automáticamente según la familia de ClassicGes

### Agente Local (PC del cliente)

- **`agente-sync/sync-agent.js`** — Script Node.js independiente
  - Lee archivos .DBF con codificación win1252
  - Parsea números en formato español (coma decimal)
  - Envía por lotes de 500 productos
  - Logging detallado para diagnóstico

- **`agente-sync/package.json`** — Dependencias: dbffile, axios, dotenv

---

## Guía de Instalación en el PC del Cliente

### Requisitos
1. **Node.js** instalado (descargar de https://nodejs.org)
2. Acceso a la carpeta de datos de ClassicGes 6

### Paso 1: Preparar la carpeta

```bash
# Crear carpeta en el PC del cliente
mkdir C:\jcapiSync

# Copiar los archivos sync-agent.js y package.json a esa carpeta

# Instalar dependencias
cd C:\jcapiSync
npm install
```

### Paso 2: Configurar variables

Crear un archivo `.env` en `C:\jcapiSync\.env`:

```env
# TODO: [CLIENTE] - Ruta real al archivo .DBF de artículos
DBF_FILE_PATH=C:\ClassicGes6\Datos\ARTICULOS.DBF

# TODO: [CLIENTE] - URL real del backend en producción
API_URL=https://tu-dominio.com/api/sync

# TODO: [CLIENTE] - API Key real (debe coincidir con la del servidor)
SYNC_API_KEY=secreto_super_seguro_123

# OPCIONAL: Si los nombres de campo del .DBF son distintos
# DBF_FIELD_SKU=CODIGO
# DBF_FIELD_NAME=NOMBRE
# DBF_FIELD_SUPPLIER=REFPROVED
# DBF_FIELD_FAMILY=FAMILIA
# DBF_FIELD_STOCK=EXISTENCIA
# DBF_FIELD_PVP=PVP
# DBF_FIELD_PVP_IVA=PVPIVA
```

### Paso 3: Crear archivo .bat

Crear `C:\jcapiSync\ejecutar_sync.bat`:

```bat
@echo off
cd /d C:\jcapiSync
node sync-agent.js >> sync_log.txt 2>&1
```

### Paso 4: Programador de Tareas de Windows

1. Abrir **Programador de tareas** (Task Scheduler)
2. **Crear tarea** (no "tarea básica")
3. **General:**
   - Nombre: `Sincronizacion jcapi ClassicGes`
   - Marcar: "Ejecutar tanto si el usuario ha iniciado sesión como si no"
   - Marcar: "Ejecutar con los privilegios más altos"
   - Marcar: "Oculta"
4. **Desencadenadores:**
   - Diariamente, repetir cada **1 hora**, indefinidamente
5. **Acciones:**
   - Iniciar programa: `C:\jcapiSync\ejecutar_sync.bat`
   - Iniciar en: `C:\jcapiSync\`
6. **Guardar** (introducir credenciales de administrador)

### Mantenimiento

- **Logs:** `C:\jcapiSync\sync_log.txt`
- **Prueba manual:** Ejecutar `ejecutar_sync.bat` haciendo doble clic
- **Verificar campos DBF:** La primera vez, ejecutar el script y revisar los logs para confirmar que los nombres de campo coinciden
