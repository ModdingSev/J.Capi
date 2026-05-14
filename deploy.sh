#!/usr/bin/env bash
# deploy.sh — J.Capi — VPS: root@72.60.213.92
# Frontend :3000  |  Backend API :4000
# Sin dominio por ahora → acceso directo por IP:puerto

set -euo pipefail

VPS_USER="root"
VPS_IP="72.60.213.92"
SSH_KEY="${SSH_KEY:-~/.ssh/id_ed25519}"
PROJECT_NAME="jcapi"
APP_PORT_BACKEND="4000"
APP_PORT_FRONTEND="3008"
REMOTE_DIR="/opt/${PROJECT_NAME}"
NGINX_CONF="/etc/nginx/sites-available/${PROJECT_NAME}.conf"

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
PINK="\033[0;35m"
RESET="\033[0m"

info()    { echo -e "${CYAN}   $*${RESET}"; }
success() { echo -e "${GREEN}OK $*${RESET}"; }
warn()    { echo -e "${YELLOW}!! $*${RESET}"; }
error()   { echo -e "${RED}ERROR: $*${RESET}"; exit 1; }
header()  { echo -e "\n${BOLD}${PINK}===  $*  ===${RESET}\n"; }

SSH_OPTS="-o StrictHostKeyChecking=accept-new -o BatchMode=yes"

ssh_run()    { ssh $SSH_OPTS -i "$SSH_KEY" "${VPS_USER}@${VPS_IP}" "$@"; }
scp_upload() { scp $SSH_OPTS -i "$SSH_KEY" "$1" "${VPS_USER}@${VPS_IP}:$2"; }

current_version() {
  node -p "require('./backend/package.json').version"
}

bump_version() {
  local cur=$(current_version)
  local new=$(node -e "
    const parts = '$cur'.split('.').map(Number);
    parts[2] = (parts[2] || 0) + 1;
    process.stdout.write(parts.join('.'));
  ")
  node -e "
    const fs = require('fs');
    for (const p of ['./backend/package.json', './frontend/package.json']) {
      try {
        const j = JSON.parse(fs.readFileSync(p, 'utf8'));
        j.version = '$new';
        fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
      } catch(e) {}
    }
  "
  info "Versión bumpeada: v${cur} → v${new} (próximo deploy)"
}

check_deps() {
  for cmd in docker ssh scp node; do
    command -v "$cmd" &>/dev/null || error "Falta $cmd"
  done
  [[ -f ".env.production" ]] || error "Falta .env.production — copia .env.production.example y rellénalo"
}

build_image() {
  header "Construyendo imágenes Docker (linux/amd64)"

  info "→ Backend..."
  DOCKER_BUILDKIT=0 docker build \
    --platform linux/amd64 \
    -f backend/Dockerfile.prod \
    -t "jcapi-backend:latest" \
    ./backend || {
      warn "Build backend falló localmente, intentando en VPS..."
      build_image_remote
      return
    }
  success "Backend construido"

  info "→ Frontend (bakeando URLs: http://${VPS_IP}:${APP_PORT_BACKEND}/api)..."
  DOCKER_BUILDKIT=0 docker build \
    --platform linux/amd64 \
    -f frontend/Dockerfile.prod \
    --build-arg NEXT_PUBLIC_API_URL="http://${VPS_IP}:${APP_PORT_BACKEND}/api" \
    --build-arg NEXT_PUBLIC_SITE_URL="http://${VPS_IP}:${APP_PORT_FRONTEND}" \
    --build-arg NEXT_PUBLIC_SITE_NAME="J. Capi" \
    -t "jcapi-frontend:latest" \
    ./frontend || {
      warn "Build frontend falló localmente, intentando en VPS..."
      build_image_remote
      return
    }
  success "Frontend construido"
}

build_image_remote() {
  header "Build remoto en VPS"
  info "Subiendo código fuente al VPS..."

  ssh_run "mkdir -p ${REMOTE_DIR}"
  tar czf - \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=.next \
    --exclude=build . | \
    ssh $SSH_OPTS -i "$SSH_KEY" "${VPS_USER}@${VPS_IP}" "cd ${REMOTE_DIR} && tar xzf -"

  info "Construyendo backend en el VPS..."
  ssh_run "cd ${REMOTE_DIR} && docker build \
    --platform linux/amd64 \
    -f backend/Dockerfile.prod \
    -t jcapi-backend:latest \
    ./backend"

  info "Construyendo frontend en el VPS..."
  ssh_run "cd ${REMOTE_DIR} && docker build \
    --platform linux/amd64 \
    -f frontend/Dockerfile.prod \
    --build-arg NEXT_PUBLIC_API_URL='http://${VPS_IP}:${APP_PORT_BACKEND}/api' \
    --build-arg NEXT_PUBLIC_SITE_URL='http://${VPS_IP}:${APP_PORT_FRONTEND}' \
    --build-arg NEXT_PUBLIC_SITE_NAME='J. Capi' \
    -t jcapi-frontend:latest \
    ./frontend"

  success "Imágenes construidas en el VPS"
}

transfer_image() {
  header "Transfiriendo imágenes al VPS"

  # Si se construyó en remoto, no hay nada que transferir
  ssh_run "docker image inspect jcapi-backend:latest &>/dev/null" 2>/dev/null && \
  ssh_run "docker image inspect jcapi-frontend:latest &>/dev/null" 2>/dev/null && {
    info "Las imágenes ya están en el VPS (build remoto)"
    return
  } || true

  info "Subiendo backend (puede tardar unos minutos)..."
  docker save "jcapi-backend:latest" \
    | gzip \
    | ssh $SSH_OPTS -i "$SSH_KEY" "${VPS_USER}@${VPS_IP}" "gunzip | docker load"
  success "Backend cargado en VPS"

  info "Subiendo frontend (puede tardar unos minutos)..."
  docker save "jcapi-frontend:latest" \
    | gzip \
    | ssh $SSH_OPTS -i "$SSH_KEY" "${VPS_USER}@${VPS_IP}" "gunzip | docker load"
  success "Frontend cargado en VPS"
}

deploy_container() {
  header "Desplegando contenedores"
  TMP=$(mktemp /tmp/compose-XXXXXX)
  cat > "$TMP" << 'COMPOSE'
services:
  jcapi-postgres:
    image: postgres:16-alpine
    container_name: jcapi-postgres
    restart: always
    environment:
      POSTGRES_DB: jcapi_db
      POSTGRES_USER: jcapi_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - jcapi_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jcapi_user -d jcapi_db"]
      interval: 5s
      timeout: 5s
      retries: 10

  jcapi-backend:
    image: jcapi-backend:latest
    container_name: jcapi-backend
    restart: always
    ports:
      - "4000:4000"
    env_file:
      - .env.production
    depends_on:
      jcapi-postgres:
        condition: service_healthy

  jcapi-frontend:
    image: jcapi-frontend:latest
    container_name: jcapi-frontend
    restart: always
    ports:
      - "3008:3000"
    environment:
      - API_URL=http://jcapi-backend:4000/api
    depends_on:
      - jcapi-backend

volumes:
  jcapi_pgdata:
COMPOSE

  ssh_run "mkdir -p ${REMOTE_DIR}"
  scp_upload "$TMP" "${REMOTE_DIR}/docker-compose.yml"
  rm -f "$TMP"

  scp_upload ".env.production" "${REMOTE_DIR}/.env.production"
  # .env lo lee Docker Compose para sustituir ${POSTGRES_PASSWORD} en el YAML
  ssh_run "cp ${REMOTE_DIR}/.env.production ${REMOTE_DIR}/.env"

  ssh_run "cd ${REMOTE_DIR} && docker compose down --remove-orphans || true"
  ssh_run "cd ${REMOTE_DIR} && docker compose up -d"
  ssh_run "docker image prune -f" || true

  success "Contenedores corriendo → backend :${APP_PORT_BACKEND}  |  frontend :${APP_PORT_FRONTEND}"
}

configure_nginx() {
  header "Configurando Nginx (IP directa sin dominio)"
  TMP=$(mktemp /tmp/nginx-XXXXXX)
  cat > "$TMP" << NGINX
server {
    listen 80;
    server_name ${VPS_IP};
    client_max_body_size 25M;

    # API → backend
    location /api {
        proxy_pass         http://127.0.0.1:${APP_PORT_BACKEND};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
    }

    # Frontend → Next.js
    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT_FRONTEND};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection upgrade;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

  scp_upload "$TMP" "/tmp/${PROJECT_NAME}.conf"
  rm -f "$TMP"
  ssh_run "mv /tmp/${PROJECT_NAME}.conf ${NGINX_CONF} && \
           ln -sf ${NGINX_CONF} /etc/nginx/sites-enabled/${PROJECT_NAME}.conf && \
           nginx -t && systemctl reload nginx"
  success "Nginx configurado: http://${VPS_IP}/ → frontend  |  http://${VPS_IP}/api → backend"
  warn "Sin dominio no se puede instalar SSL. Añade un dominio y vuelve a ejecutar opción 4."
}

renew_ssl() {
  header "Renovando SSL (Let's Encrypt)"
  ssh_run "certbot renew --nginx --non-interactive"
  ssh_run "systemctl reload nginx"
  success "Certificados renovados y Nginx recargado"
}

show_logs() {
  echo -e "  ${BOLD}1)${RESET} Backend"
  echo -e "  ${BOLD}2)${RESET} Frontend"
  read -rp "  ¿Logs de qué servicio? [1]: " SVC
  SVC="${SVC:-1}"
  case "$SVC" in
    1) ssh_run "docker logs -f --tail=150 jcapi-backend" ;;
    2) ssh_run "docker logs -f --tail=150 jcapi-frontend" ;;
    *) error "Opción inválida" ;;
  esac
}

show_status() {
  header "Estado del VPS"
  ssh_run "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
  echo ""
  ssh_run "df -h / | tail -1 | awk '{print \"Disco: \"\$3\" / \"\$2\" (\"\$5\" lleno)\"}'"
  echo ""
  info "Comprobando salud de los servicios..."
  ssh_run "curl -sf http://127.0.0.1:${APP_PORT_BACKEND}/api/health && echo ' ← backend OK' || echo 'backend: no responde'"
  ssh_run "curl -sf -o /dev/null -w '%{http_code}' http://127.0.0.1:${APP_PORT_FRONTEND}/ | grep -q '200\|304' && echo 'frontend OK' || echo 'frontend: no responde'"
}

show_summary() {
  header "Despliegue completado"
  echo -e "  Frontend:  ${CYAN}http://${VPS_IP}:${APP_PORT_FRONTEND}${RESET}"
  echo -e "  Backend:   ${CYAN}http://${VPS_IP}:${APP_PORT_BACKEND}/api${RESET}"
  echo -e "  VPS:       ${VPS_USER}@${VPS_IP}"
  echo -e "  Versión:   ${CYAN}v$(current_version)${RESET}"
  success "J.Capi actualizado en producción"
}

db_push() {
  header "Exportando BD local → VPS"
  LOCAL_DB="${PGDATABASE:-jcapi_db}"
  LOCAL_USER="${PGUSER:-$(whoami)}"
  DUMP=/tmp/jcapi_push.sql
  TABLES='--table=brands --table=categories --table=products --table=product_images --table=blog_posts --table=reservations --table=reservation_items'

  info "Exportando datos locales..."
  eval "pg_dump -U $LOCAL_USER -d $LOCAL_DB --data-only $TABLES --no-owner --no-acl -f $DUMP" || error "pg_dump falló"
  grep -v 'transaction_timeout' "$DUMP" > "${DUMP}.clean" && mv "${DUMP}.clean" "$DUMP"

  info "Subiendo dump al VPS..."
  scp_upload "$DUMP" "/tmp/jcapi_push.sql"
  ssh_run "docker cp /tmp/jcapi_push.sql jcapi-backend:/tmp/jcapi_push.sql && \
           docker exec jcapi-backend sh -c 'psql \"\$DATABASE_URL\" < /tmp/jcapi_push.sql' && \
           rm /tmp/jcapi_push.sql"
  rm -f "$DUMP"
  success "Datos locales importados en el VPS"
}

db_pull() {
  header "Exportando BD del VPS → Local"
  LOCAL_DB="${PGDATABASE:-jcapi_db}"
  LOCAL_USER="${PGUSER:-$(whoami)}"
  DUMP=/tmp/jcapi_pull.sql
  TABLES='--table=brands --table=categories --table=products --table=product_images --table=blog_posts --table=reservations --table=reservation_items'

  info "Exportando datos del VPS..."
  ssh_run "docker exec jcapi-backend sh -c \"pg_dump \\\"\\\$DATABASE_URL\\\" --data-only ${TABLES} --no-owner --no-acl\"" > "$DUMP"

  info "Importando en BD local..."
  psql -U "$LOCAL_USER" -d "$LOCAL_DB" -f "$DUMP" || error "psql local falló"
  rm -f "$DUMP"
  success "Datos del VPS importados en local"
}

main() {
  echo ""
  echo -e "${BOLD}${PINK}============================================${RESET}"
  echo -e "${BOLD}${PINK}   J.Capi — Panel de Despliegue${RESET}"
  echo -e "${BOLD}${PINK}   VPS: ${VPS_USER}@${VPS_IP}${RESET}"
  echo -e "${BOLD}${PINK}   Frontend :${APP_PORT_FRONTEND}  |  Backend :${APP_PORT_BACKEND}${RESET}"
  echo -e "${BOLD}${PINK}============================================${RESET}"
  echo ""
  check_deps
  echo -e "  ${BOLD}1)${RESET}  Actualizar J.Capi     ${CYAN}(build + subir + reiniciar)${RESET}"
  echo -e "  ${BOLD}2)${RESET}  Despliegue completo   ${CYAN}(build + subir + Docker + Nginx)${RESET}"
  echo -e "  ${BOLD}3)${RESET}  Solo reiniciar        ${CYAN}(sin rebuild)${RESET}"
  echo -e "  ${BOLD}4)${RESET}  Configurar Nginx      ${CYAN}(primera vez o actualizar conf)${RESET}"
  echo -e "  ${BOLD}5)${RESET}  Renovar certificados SSL"
  echo -e "  ${BOLD}6)${RESET}  Ver logs en tiempo real"
  echo -e "  ${BOLD}7)${RESET}  Estado del VPS"
  echo -e "  ${BOLD}8)${RESET}  Local → VPS           ${CYAN}(subir datos de tu Mac al VPS)${RESET}"
  echo -e "  ${BOLD}9)${RESET}  VPS → Local           ${CYAN}(bajar datos del VPS a tu Mac)${RESET}"
  echo -e "  ${BOLD}10)${RESET} Salir"
  echo ""
  read -rp "  Opción [1]: " OP
  OP="${OP:-1}"
  echo ""
  case "$OP" in
    1)  build_image; transfer_image; deploy_container; show_summary; bump_version ;;
    2)  build_image; transfer_image; deploy_container; configure_nginx; show_summary; bump_version ;;
    3)  info "Reiniciando..."; ssh_run "cd ${REMOTE_DIR} && docker compose restart"; success "Contenedores reiniciados" ;;
    4)  configure_nginx ;;
    5)  renew_ssl ;;
    6)  show_logs ;;
    7)  show_status ;;
    8)  db_push ;;
    9)  db_pull ;;
    10) echo 'Saliendo.'; exit 0 ;;
    *)  error "Opción inválida: $OP" ;;
  esac
}

main "$@"
