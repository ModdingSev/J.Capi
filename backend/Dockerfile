FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

# Push schema to DB (force accept data loss if any schema conflicts), run seeds, and start dev server
CMD npx prisma db push --accept-data-loss && npx prisma db seed && npm run dev
