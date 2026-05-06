# J. Capi — Tienda de Electrodomésticos

Aplicación web ecommerce completa para la tienda de electrodomésticos **J. Capi**.

---

## 🏗️ Stack Tecnológico

| Capa        | Tecnología              |
|-------------|-------------------------|
| Frontend    | Next.js 14 (App Router) |
| Estilos     | Tailwind CSS            |
| Backend     | Node.js + Express       |
| ORM         | Prisma                  |
| Base datos  | PostgreSQL               |
| Lenguaje    | TypeScript              |

---

## 📁 Estructura del Proyecto

```
JCAPI/
├── backend/          # API REST Express + Prisma
│   ├── prisma/       # Schema y seeds
│   └── src/          # Código fuente
└── frontend/         # Next.js App Router
    └── src/
        ├── app/      # Rutas (App Router)
        ├── components/
        ├── lib/
        └── types/
```

---

## 🚀 Inicio Rápido (Despliegue con Docker)

El proyecto está preparado para desplegarse de forma sencilla y unificada usando **Docker Compose**, lo que levantará automáticamente el Frontend, el Backend, la base de datos PostgreSQL y un gestor pgAdmin.

### Requisitos

- Docker
- Docker Compose

### Pasos de Despliegue

1. **Abre tu terminal** en la carpeta raíz del proyecto (`JCAPI`).
2. **Ejecuta Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   *(Añade `-d` al final si quieres ejecutarlo en segundo plano).*

¡Ya está! Docker se encarga de:
- Instalar las dependencias (`npm install`) tanto en el backend como en el frontend.
- Ejecutar las migraciones de base de datos (`npx prisma db push`).
- Generar los datos de prueba (`npx prisma db seed`).

### 🌐 Servicios Disponibles

Una vez que termine el proceso, tendrás disponibles los siguientes servicios:

- **Frontend (Catálogo y Reservas)**: `http://localhost:3000`
- **Panel de Administración (TPV)**: `http://localhost:3000/admin` (Contraseña por defecto: `admin123`)
- **Backend (API REST)**: `http://localhost:4000`
- **Base de Datos (PostgreSQL)**: Expuesta en el puerto `5432`
- **pgAdmin (Gestor de BD visual)**: `http://localhost:5050`
  - *Email*: `admin@admin.com`
  - *Password*: `admin`

---

## 🛠️ Desarrollo en Local (Modo manual sin Docker)

Si necesitas desarrollar y prefieres no usar Docker para los servidores Node.js, sigue estos pasos (necesitas Node.js >= 18 y PostgreSQL instalados):

### 1. Preparar Base de Datos (PostgreSQL)
```bash
createdb jcapi_db
```

### 2. Levantar el Backend
```bash
cd backend
npm install

# Generar cliente y migrar base de datos
npx prisma generate
npx prisma db push
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Levantar el Frontend
Abre otra terminal:
```bash
cd frontend
npm install

# Iniciar servidor de desarrollo
npm run dev
```

---

## 🔌 API Endpoints

| Método | Ruta                          | Descripción                         |
|--------|-------------------------------|-------------------------------------|
| GET    | `/api/products`               | Listado con filtros y paginación     |
| GET    | `/api/products/:slug`         | Detalle de producto                 |
| GET    | `/api/categories`             | Árbol de categorías                 |
| GET    | `/api/categories/:slug`       | Categoría con subcategorías         |
| GET    | `/api/filters`                | Filtros disponibles (precio, marca) |
| GET    | `/api/blog`                   | Listado de artículos                |
| GET    | `/api/blog/:slug`             | Artículo de blog                    |
| GET    | `/api/search?q=`              | Búsqueda de productos               |

### Parámetros de `/api/products`

| Parámetro    | Tipo     | Descripción                           |
|--------------|----------|---------------------------------------|
| `page`       | number   | Página (defecto: 1)                   |
| `limit`      | number   | Resultados por página (defecto: 12)   |
| `category`   | string   | Slug de categoría o subcategoría      |
| `brand`      | string   | Slug de marca                         |
| `minPrice`   | number   | Precio mínimo                         |
| `maxPrice`   | number   | Precio máximo                         |
| `energy`     | string   | Etiqueta energética (A+++, A++, etc.) |
| `sort`       | string   | `price_asc`, `price_desc`, `newest`   |
| `q`          | string   | Búsqueda por texto                    |

---

## 🗄️ Modelos de Base de Datos

- **Category**: categorías y subcategorías jerárquicas
- **Product**: productos con atributos, imágenes, precio
- **Brand**: marcas de electrodomésticos
- **ProductImage**: imágenes de productos
- **BlogPost**: artículos del blog

---

## 🎨 Diseño

- **Color principal**: `#CC0000` (rojo)
- **Fondo**: `#F4F2EE`
- **Tipografía**: Inter (Google Fonts)
- **Estilo**: Ecommerce moderno, mobile-first

---

## 🧭 Estructura de Navegación

### Top Bar Principal (siempre visible)
- Logo J. Capi
- Inicio / Catálogo / Blog / Servicio Técnico / Contacto
- Icono carrito
- **SIN buscador**

### Segundo Top Bar (solo en /catalogo/*)
- Barra de búsqueda
- Categorías: Frigoríficos · Congeladores · Lavado · Lavavajillas · Cocción · Hornos · Microondas
- Mega menú con subcategorías al hacer hover

---

## 🗂️ Categorías

| Categoría      | Subcategorías                                                         |
|----------------|-----------------------------------------------------------------------|
| Frigoríficos   | Combi, Americanos, Una puerta, Bajo encimera                          |
| Congeladores   | Verticales, Horizontales (arcón)                                      |
| Lavado         | Lavadoras, Lavadoras-secadoras, Secadoras                             |
| Lavavajillas   | 60cm, 45cm, Bajo encimera                                             |
| Cocción        | Inducción, Vitrocerámica, Gas, Campanas extractoras                   |
| Hornos         | Eléctricos, Gas, Compactos                                            |
| Microondas     | Sobremesa, Integrable, Con grill                                      |

---

## 📈 SEO

- Metadata dinámica por página
- Open Graph y Twitter Cards
- JSON-LD Schema.org (Product, BreadcrumbList, Organization, WebSite)
- Sitemap XML dinámico
- robots.txt
- URLs limpias y semánticas
- H1 único por página
- Breadcrumbs navegables

---

## 📱 Responsive

- Mobile-first design
- Filtros como drawer en móvil
- Segundo top bar con scroll horizontal en móvil
- Imágenes optimizadas con next/image

---

## 🧪 Datos de Prueba

Se generan automáticamente con `npx prisma db seed`:

- 7 categorías principales con subcategorías
- 4 marcas (Samsung, LG, Bosch, Siemens)
- **12 productos de lavado** con todos los atributos
- 3 artículos de blog de ejemplo

---

## 🔧 Scripts

### Backend
| Script          | Descripción                    |
|-----------------|--------------------------------|
| `npm run dev`   | Servidor con hot-reload (tsx)  |
| `npm run build` | Compilar TypeScript            |
| `npm start`     | Producción                     |
| `npm run seed`  | Poblar base de datos           |

### Frontend
| Script          | Descripción                    |
|-----------------|--------------------------------|
| `npm run dev`   | Dev server con Turbopack        |
| `npm run build` | Build de producción            |
| `npm start`     | Servidor de producción         |
| `npm run lint`  | Linting                        |
