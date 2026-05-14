FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

# Push schema to DB, attempt seed (don't block on failure), then start dev server
# Using npx to find ts-node-dev/ts-node from local node_modules
CMD npx prisma db push --accept-data-loss && \
    (npx prisma db seed || echo "⚠️  Seed skipped or already applied") && \
    npx ts-node-dev --respawn --transpile-only --poll src/index.ts
