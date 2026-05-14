#!/bin/bash
# ============================================================================
# Script de prueba para simular sincronizaciones de ClassicGes
# Uso: ./test-sync.sh [nuevo|venta|restock|listado]
# ============================================================================

API="http://localhost:4000/api/sync"
KEY="Bearer secreto_super_seguro_123"

case "$1" in

  # ─── PRODUCTO NUEVO ────────────────────────────────────────────────────────
  # Simula que ClassicGes ha escaneado/dado de alta un artículo nuevo
  nuevo)
    echo "📦 Simulando ALTA de producto nuevo desde ClassicGes..."
    curl -s -X POST "$API" \
      -H "Authorization: $KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "products": [{
          "sku": "TOSTAV-2000X",
          "name": "TOSTADOR DOBLE RANURA VERTICAL 2000W INOX",
          "supplierRef": "8400012345678",
          "family": "TOSTADOR",
          "stock": 8,
          "priceBase": 41.32,
          "price": 49.99
        }]
      }' | python3 -m json.tool
    ;;

  # ─── VENTA (stock baja) ────────────────────────────────────────────────────
  # Simula que se han vendido unidades en tienda → ClassicGes reporta menos stock
  venta)
    echo "🛒 Simulando VENTA (stock baja de 8 → 5)..."
    curl -s -X POST "$API" \
      -H "Authorization: $KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "products": [{
          "sku": "TOSTAV-2000X",
          "name": "TOSTADOR DOBLE RANURA VERTICAL 2000W INOX",
          "supplierRef": "8400012345678",
          "family": "TOSTADOR",
          "stock": 5,
          "priceBase": 41.32,
          "price": 49.99
        }]
      }' | python3 -m json.tool
    ;;

  # ─── RESTOCK (stock sube) ──────────────────────────────────────────────────
  # Simula que ha llegado mercancía al almacén → ClassicGes reporta más stock
  restock)
    echo "📦 Simulando RESTOCK (stock sube de 5 → 20)..."
    curl -s -X POST "$API" \
      -H "Authorization: $KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "products": [{
          "sku": "TOSTAV-2000X",
          "name": "TOSTADOR DOBLE RANURA VERTICAL 2000W INOX",
          "supplierRef": "8400012345678",
          "family": "TOSTADOR",
          "stock": 20,
          "priceBase": 41.32,
          "price": 49.99
        }]
      }' | python3 -m json.tool
    ;;

  # ─── SYNC MASIVA ───────────────────────────────────────────────────────────
  # Simula una sincronización completa con varios productos a la vez
  masiva)
    echo "🔄 Simulando SYNC MASIVA (5 productos de golpe)..."
    curl -s -X POST "$API" \
      -H "Authorization: $KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "products": [
          {
            "sku": "MIC-GRUN-800",
            "name": "MICROONDAS GRUNKEL 20L 800W BLANCO",
            "supplierRef": "8426156019000",
            "family": "MICROONDAS",
            "stock": 4,
            "priceBase": 57.85,
            "price": 69.99
          },
          {
            "sku": "CAMP-TUR-60",
            "name": "CAMPANA EXTRACTORA TURBO 60CM INOX 3V",
            "supplierRef": "",
            "family": "CAMPANAS",
            "stock": 2,
            "priceBase": 99.17,
            "price": 119.99
          },
          {
            "sku": "PLCH-ROWENTA",
            "name": "PLANCHA VAPOR ROWENTA DW6030 2400W",
            "supplierRef": "4210101952603",
            "family": "PLANCHADO",
            "stock": 6,
            "priceBase": 45.45,
            "price": 54.99
          },
          {
            "sku": "BATI-BRAUN-MQ",
            "name": "BATIDORA BRAUN MULTIQUICK 5 MQ535 600W",
            "supplierRef": "8021098771988",
            "family": "BATIDORA VARILLA",
            "stock": 3,
            "priceBase": 49.59,
            "price": 59.99
          },
          {
            "sku": "CONG-TENSAI-V",
            "name": "CONGELADOR VERTICAL TENSAI 185CM NO FROST",
            "supplierRef": "",
            "family": "CONGELADOR",
            "stock": 1,
            "priceBase": 371.07,
            "price": 449.00
          }
        ]
      }' | python3 -m json.tool
    ;;

  # ─── VER PRODUCTO ──────────────────────────────────────────────────────────
  # Consulta un producto por búsqueda para verificar los cambios
  ver)
    QUERY="${2:-TOSTADOR}"
    echo "🔍 Buscando productos con: '$QUERY'..."
    curl -s "http://localhost:4000/api/products?q=$QUERY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
products = data.get('data', [])
if not products:
    print('  No se encontraron productos.')
else:
    for p in products:
        print(f\"  [{p['sku']}] {p['name']}\")
        print(f\"    Precio: {p['price']}€ | Stock: {p['stock']} | Categoría: {p['category']['name']}\")
        parent = p['category'].get('parent')
        if parent:
            print(f\"    Cat. padre: {parent['name']}\")
        print()
"
    ;;

  # ─── AYUDA ─────────────────────────────────────────────────────────────────
  *)
    echo ""
    echo "  Uso: ./test-sync.sh [comando]"
    echo ""
    echo "  Comandos disponibles:"
    echo "    nuevo    → Da de alta un producto nuevo (Tostador)"
    echo "    venta    → Simula venta: stock baja 8 → 5"
    echo "    restock  → Simula reposición: stock sube 5 → 20"
    echo "    masiva   → Sync masiva de 5 productos variados"
    echo "    ver      → Busca un producto (ej: ./test-sync.sh ver MICROONDAS)"
    echo ""
    echo "  Flujo típico de prueba:"
    echo "    1. ./test-sync.sh nuevo       # Crea el tostador"
    echo "    2. ./test-sync.sh ver         # Verificas stock=8"
    echo "    3. ./test-sync.sh venta       # Simulas venta"
    echo "    4. ./test-sync.sh ver         # Verificas stock=5"
    echo "    5. ./test-sync.sh restock     # Entra mercancía"
    echo "    6. ./test-sync.sh ver         # Verificas stock=20"
    echo "    7. ./test-sync.sh masiva      # Sync completa"
    echo "    8. ./test-sync.sh ver CAMPANA # Buscas otro"
    echo ""
    ;;

esac
