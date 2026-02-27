# --- 1. BUILDER ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de config globaux
COPY package*.json ./
COPY biome.json ./

# Copier les sous-projets
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Installer TOUTES les dépendances (nécessaire pour la compilation)
RUN npm install

# Copier tout le code source
COPY . .

# Construire les types partagés AVANT le backend
RUN npm run build --workspace=@projet/shared-types

# Générer le client Prisma (Backend)
WORKDIR /app/apps/backend
RUN npx prisma generate

# Construire le Backend (génère le dossier dist/)
RUN npm run build


# --- 2. RUNNER (Image de production optimisée) ---
FROM node:20-alpine

WORKDIR /app

# On sécurise la prod
ENV NODE_ENV=production
ENV PORT=3000

# 1. Copier les node_modules globaux (contient le client Prisma généré et les symlinks)
COPY --from=builder /app/node_modules ./node_modules

# 2. Copier le package local pour les types partagés
COPY --from=builder /app/packages ./packages

# 3. On ne copie QUE ce qui est vital pour faire tourner le backend
# On ignore /src, /test, tsconfig, etc.
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma 

# Se placer dans le backend
WORKDIR /app/apps/backend

EXPOSE 3000

# Lancer le script start:prod (qui fera le npx prisma migrate deploy && node dist/main.js)
CMD ["npm", "run", "start:prod"]