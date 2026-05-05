# Famille d'Accueil Animaux - Monorepo

Application web de mise en relation entre refuges et familles d'accueil pour animaux.

## 📚 Table des matières

- [Stack Technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Scripts disponibles](#scripts-disponibles)
- [Structure du projet](#structure-du-projet)
- [Base de données & Persistance](#base-de-données--persistance)
- [Documentation API (Swagger)](#documentation-api-swagger)
- [Workflow Git](#workflow-git)

## Stack Technique

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Monorepo**: npm workspaces
- **Documentation API**: Swagger/OpenAPI
- **Qualité**: Biome (Linter & Formatter)

## Prérequis

- Node.js >= 18
- npm >= 9
- Docker & Docker Compose (v2)
- Port PostgreSQL : 5432
- Port Backend : 3001
- Port Frontend : 5173

## Installation

### 1. Cloner le repository

```bash
git clone <url>
cd projet
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer la base de données PostgreSQL

```bash
npm run docker:up
```

### 4. Configurer les variables d'environnement

```bash
cp apps/backend/.env.example apps/backend/.env
# Éditer apps/backend/.env si nécessaire
```

Exemple de configuration dans `apps/backend/.env` :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/petfosterconnect?schema=public"
PORT=3001
JWT_SECRET="votre_secret_jwt_a_changer"
FRONTEND_URL="http://localhost:5173"

# Emails (Configurable via SMTP)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=votre_utilisateur
SMTP_PASS=votre_mot_de_passe
SMTP_FROM="PetFosterConnect <no-reply@petfosterconnect.com>"

# Sécurité Cookies
COOKIE_DOMAIN=".petfosterconnect.com" # Optionnel
```

### 5. Initialiser Prisma

Les dépendances Prisma 6 (`@prisma/client`, `prisma`, `@prisma/config`) sont gérées dans l'espace de travail backend.

#### a. Lancer la migration (création des tables)

```bash
npm run prisma:migrate
```

#### b. Générer le client Prisma

```bash
npm run prisma:generate
```

#### c. Peupler la base de données (Seed)

```bash
npm run prisma:seed
```

### 6. Lancer le projet en mode développement

```bash
# Depuis la racine du projet
npm run dev
```

Accès aux services :

- **Backend API**: <http://localhost:3001>
- **Frontend**: <http://localhost:5173>
- **Documentation Swagger**: <http://localhost:3001/api>

## Scripts disponibles

### Scripts globaux (depuis la racine)

```bash
npm run dev              # Lance backend + frontend en parallèle
npm run build            # Build complet du projet (Shared Types -> Backend -> Frontend)
npm run dev:backend      # Lance uniquement le backend
npm run dev:frontend     # Lance uniquement le frontend
```

### Scripts de Qualité & Tests

```bash
npm run format           # Formater le code avec Biome
npm run lint             # Vérifier le linting avec Biome
npm run test             # Lancer tous les tests (BE & FE)
npm run test:backend     # Lancer les tests backend
npm run test:frontend    # Lancer les tests frontend
npm run test:e2e         # Lancer les tests de bout en bout (Backend)
```

### Scripts Docker

```bash
npm run docker:up        # Démarre PostgreSQL via Docker Compose
npm run docker:down      # Arrête les conteneurs
```

### Scripts Prisma

Ces scripts s'exécutent depuis la racine et ciblent le workspace backend.

```bash
npm run prisma:generate  # Génère le client Prisma
npm run prisma:migrate   # Applique les migrations en mode dev
npm run prisma:studio    # Ouvre Prisma Studio
npm run prisma:seed      # Exécute le script de seed
```

## Structure du projet

```text
projet/
├── apps/
│   ├── backend/          # API NestJS
│   │   ├── src/
│   │   │   ├── animals/
│   │   │   ├── applications/
│   │   │   ├── auth/
│   │   │   ├── bookmarks/
│   │   │   ├── common/   # Filtres, guards, middlewares globaux
│   │   │   ├── emails/
│   │   │   ├── health/   # Check de santé de l'API
│   │   │   ├── shelters/
│   │   │   ├── species/
│   │   │   ├── users/
│   │   │   └── main.ts   # Configuration Nest & Swagger
│   │   └── prisma/
│   │       └── schema.prisma
│   └── frontend/         # Application React
│       └── src/
├── packages/
│   └── shared-types/     # Types TypeScript partagés
├── docker-compose.yml
├── biome.json            # Configuration du linter/formatter
└── package.json
```

## Base de données & Persistance

Le backend utilise **NestJS**, **Prisma 6** et **PostgreSQL** (via Docker).

### Commandes Prisma utiles (via scripts racine)

```bash
# Créer une nouvelle migration
npm run prisma:migrate

# Visualiser la base de données
npm run prisma:studio
```

## Documentation API (Swagger)

L'API est documentée avec **Swagger/OpenAPI**.

### Accès à la documentation

Une fois le backend lancé, accédez à : `http://localhost:3001/api`

### Tags disponibles

| Tag            | Description                      |
| -------------- | -------------------------------- |
| `animals`      | Gestion des animaux              |
| `applications` | Gestion des demandes d'adoption  |
| `auth`         | Authentification et autorisation |
| `bookmarks`    | Gestion des favoris              |
| `emails`       | Envoi d'emails                   |
| `shelters`     | Gestion des refuges              |
| `species`      | Liste des espèces                |
| `users`        | Gestion des utilisateurs         |
| `health`       | État de santé de l'API           |

## Workflow Git

### Conventions de commit

Nous utilisons les préfixes suivant :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, pas de changement de code
- `refactor:` Amélioration du code sans changement de comportement
- `test:` Ajout ou modification de tests
- `chore:` Tâches de maintenance

## Dépannage

### La base de données ne démarre pas

```bash
# Vérifier les logs Docker
docker compose logs postgres

# Redémarrer
npm run docker:down && npm run docker:up
```

### Erreur Prisma "Client not generated"

```bash
npm run prisma:generate
```
