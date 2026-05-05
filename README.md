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

## 🚀 Inicio Rápido

### Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

### 1. Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb jcapi_db
```

---

### 2. Backend

```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu cadena de conexión PostgreSQL

# Ejecutar migraciones
npx prisma migrate dev --name init

# Poblar datos de prueba
npx prisma db seed

# Iniciar servidor
npm run dev
```

El backend estará disponible en: `http://localhost:4000`

---

### 3. Frontend

```bash
cd frontend
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Por defecto apunta a http://localhost:4000

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

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
