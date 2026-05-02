#!/bin/bash

# 1. Configuration de l'environnement
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/petfoster_test?schema=public"
export JWT_SECRET="test-secret-key-for-e2e"

echo "🛠  Préparation de la base de données de test..."

# 2. Créer la DB si elle n'existe pas
docker exec petfosterconnect-v2-db psql -U postgres -c "CREATE DATABASE petfoster_test;" 2>/dev/null || true

# 3. Pousser le schéma Prisma
npx prisma db push --schema=apps/backend/prisma/schema.prisma --accept-data-loss

echo "✅ Base de données prête. Lancement des tests..."

# 4. LANCER JEST SEQUENTIELLEMENT (--runInBand)
npx jest --config apps/backend/test/jest-e2e.json --runInBand
