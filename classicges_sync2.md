# Sincronización ClassicGes -> jcapi

Diseñar este tipo de integraciones con sistemas legacy (como ClassicGes 6) mediante un "agente local" es la arquitectura ideal. Permite mantener el servidor local aislado (sin abrir puertos en el router del cliente) mientras mantienes tu web completamente sincronizada.

A continuación te detallo la implementación completa dividida en las tres partes que solicitas.

---

### 1. Backend (Prisma / API)

Primero, definimos el modelo `Product` en tu esquema de Prisma.

```prisma
// schema.prisma

model Product {
  id        String   @id @default(uuid())
  sku       String   @unique
  name      String
  price     Float
  stock     Int
  updatedAt DateTime @updatedAt
  
  // Otros campos según las necesidades de jcapi...
}
```

Ahora, creamos el endpoint. En este ejemplo, asumiremos que usas **Next.js (App Router)** para la API (`app/api/sync/route.ts`), pero la lógica de Prisma sería idéntica en Express.

```typescript
// app/api/sync/route.ts (Next.js App Router)
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TODO: [CLIENTE] - Definir en el .env del servidor de producción.
// Ejemplo: SYNC_API_KEY=secreto_super_seguro_123
const SYNC_API_KEY = process.env.SYNC_API_KEY;

export async function POST(request: Request) {
  try {
    // 1. Validación de API Key estático
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${SYNC_API_KEY}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Parsear el payload
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Formato inválido. Se espera un array de "products"' }, { status: 400 });
    }

    // 3. Upsert en base de datos usando transacción para asegurar atomicidad
    // Usamos un bucle mapeando a operaciones de upsert
    const upsertOperations = products.map((prod: any) => {
      return prisma.product.upsert({
        where: { sku: prod.sku },
        update: {
          name: prod.name,
          price: prod.price,
          stock: prod.stock,
        },
        create: {
          sku: prod.sku,
          name: prod.name,
          price: prod.price,
          stock: prod.stock,
        },
      });
    });

    // Ejecutamos todas las operaciones en paralelo dentro de una transacción
    await prisma.$transaction(upsertOperations);

    return NextResponse.json({ 
      success: true, 
      message: `${products.length} productos sincronizados correctamente.` 
    });

  } catch (error) {
    console.error('Error sincronizando productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
```

---

### 2. Script Local (Agente de Sincronización en Node.js)

Este script vivirá en el PC Windows del cliente. Para leer el archivo DBF de ClassicGes, utilizaremos la librería `dbffile` (muy estable para node) y `axios` para la petición HTTP. 

Deberás instalar las dependencias localmente ejecutando: `npm install dbffile axios dotenv`

```javascript
// sync-agent.js
require('dotenv').config();
const { DBFFile } = require('dbffile');
const axios = require('axios');

// TODO: [CLIENTE] - Configurar estas constantes reales antes de desplegar en el PC local

// Ruta absoluta al archivo de artículos de ClassicGes en el servidor/PC local
// IMPORTANTE: Escapar las barras en Windows usando doble barra (\\) o barra invertida (/)
const DBF_FILE_PATH = process.env.DBF_FILE_PATH || 'C:\\Ruta\\A\\ClassicGes\\Datos\\ARTICULOS.DBF'; 

// URL completa hacia tu endpoint de producción
const jcapi_API_URL = process.env.jcapi_API_URL || 'https://tu-dominio.com/api/sync';

// El mismo API Key estático configurado en el servidor web
const SYNC_API_KEY = process.env.SYNC_API_KEY || 'secreto_super_seguro_123';

async function syncProducts() {
    try {
        console.log(`[${new Date().toISOString()}] Iniciando lectura de base de datos local...`);
        
        // 1. Leer el archivo .dbf de ClassicGes
        // Usamos una codificación típica para sistemas Windows hispanos (puede variar a cp850, latin1, etc)
        const dbf = await DBFFile.open(DBF_FILE_PATH, { encoding: 'win1252' });
        const records = await dbf.readRecords(dbf.recordCount);
        
        console.log(`Se han leído ${records.length} registros del archivo DBF.`);

        // 2. Transformación y Mapeo de campos
        const mappedProducts = records.map(record => {
            // TODO: [CLIENTE] - Ajustar estos nombres de campos (CODIGO, DESCRIP, PVP, STOCK)
            // exactos de acuerdo a las columnas reales que escupe ClassicGes 6.
            return {
                sku: String(record.CODIGO).trim(),
                name: String(record.DESCRIP).trim(),
                price: parseFloat(record.PVP) || 0,
                stock: parseInt(record.STOCK, 10) || 0
            };
        }).filter(prod => prod.sku); // Filtrar filas vacías o sin SKU

        // 3. Envío al endpoint
        console.log(`Enviando ${mappedProducts.length} productos a jcapi...`);
        
        const response = await axios.post(jcapi_API_URL, {
            products: mappedProducts
        }, {
            headers: {
                'Authorization': `Bearer ${SYNC_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[${new Date().toISOString()}] Sincronización exitosa:`, response.data);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR DURANTE LA SINCRONIZACIÓN:`);
        if (error.response) {
            console.error('El servidor respondió con:', error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

syncProducts();
```

---

### 3. Documentación para el Técnico / Cliente

A continuación, la guía para dejar esto funcionando automáticamente en el PC del cliente.

# Guía de Instalación del Agente de Sincronización jcapi

Esta guía explica cómo configurar el script de sincronización para que lea periódicamente la base de datos de ClassicGes y envíe el inventario a la plataforma jcapi de manera invisible.

### Pasos Previos
1. **Instalar Node.js:** Asegúrese de tener Node.js instalado en el PC del cliente (descargar de nodejs.org).
2. **Ubicar la carpeta:** Cree una carpeta en `C:\jcapiSync`.
3. Copie dentro de esta carpeta los archivos `sync-agent.js`, `package.json` y ejecute `npm install` en la terminal para descargar las dependencias.

### 1. Crear el Archivo Batch (Ejecutable)
Para facilitar que Windows ejecute el script sin dejar consolas abiertas permanentemente, crearemos un archivo `.bat`.

1. Abra el Bloc de notas.
2. Pegue el siguiente código:

```bat
@echo off
:: Cambia al directorio donde está instalado el agente
cd /d C:\jcapiSync

:: Ejecuta el script de node.js y guarda los logs en un archivo
node sync-agent.js >> sync_log.txt 2>&1
```

3. Guarde el archivo como **`ejecutar_sync.bat`** en la carpeta `C:\jcapiSync`.

### 2. Configurar la Tarea Programada en Windows
Para que esto se ejecute cada hora (por ejemplo), usaremos el Programador de Tareas nativo de Windows.

1. Pulse la tecla de Windows, escriba **Programador de tareas** (Task Scheduler) y ábralo.
2. En el panel derecho, haga clic en **Crear tarea...** (No "Crear tarea básica").
3. **Pestaña General:**
   - **Nombre:** `Sincronizacion jcapi ClassicGes`
   - **Opciones de seguridad:** Marque **"Ejecutar tanto si el usuario ha iniciado sesión como si no"** y también **"Ejecutar con los privilegios más altos"**.
     *(Nota: Pedirá la contraseña de administrador al guardar).*
   - Marque **Oculta** (para que no moleste visualmente al cliente).
4. **Pestaña Desencadenadores (Triggers):**
   - Nuevo desencadenador.
   - Comenzar la tarea: **Según una programación**.
   - Ajustar para que se repita **Diariamente**.
   - En opciones avanzadas, marque **Repetir cada: 1 hora** (o el tiempo deseado) durante **Indefinidamente**.
   - Asegúrese de que "Habilitado" esté marcado.
5. **Pestaña Acciones (Actions):**
   - Nueva acción -> **Iniciar un programa**.
   - **Programa o script:** Haga clic en Examinar y seleccione su archivo `C:\jcapiSync\ejecutar_sync.bat`.
   - **Iniciar en (opcional pero muy importante):** `C:\jcapiSync\`
6. **Pestaña Condiciones / Configuración:**
   - Desmarque la opción que dice que se detenga si la computadora funciona con batería (por precaución).
   - Marque "Permitir que la tarea se ejecute a petición".

7. **Guardar:** Haga clic en Aceptar. Introduzca las credenciales del Administrador de Windows cuando lo solicite.

### Mantenimiento
Cualquier problema de sincronización podrá revisarlo abriendo el archivo `C:\jcapiSync\sync_log.txt`.
