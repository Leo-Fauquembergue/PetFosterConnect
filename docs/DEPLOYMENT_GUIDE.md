# GUIDE DE DÉPLOIEMENT : PET FOSTER CONNECT

Ce document détaille la mise en production complète de l'écosystème **Pet Foster Connect**, un monorepo TypeScript utilisant les services gratuits de Render et Vercel.

---

## 📋 1. ARCHITECTURE TECHNIQUE
*   **Backend** : API NestJS avec Prisma ORM.
*   **Base de données** : PostgreSQL (Version 16).
*   **Frontend** : Application React (Vite) & Tailwind CSS.
*   **Shared** : Paquet npm local `@projet/shared-types` (Zod & TypeScript).
*   **Hébergement** : Render (Backend & DB) + Vercel (Frontend).

---

## 🗄️ 2. ÉTAPE 1 : BASE DE DONNÉES (RENDER)

1.  Sur Render, créez une base via **New +** > **PostgreSQL**.
2.  **Configuration** :
    *   **Name** : `petfosterconnect-db`.
    *   **Region** : `Frankfurt (EU Central)`.
    *   **Instance Type** : **Free**.
3.  **Récupération des accès** (Section *Connections*) :
    *   `Internal Database URL` : Nécessaire pour la configuration de l'API.
    *   `External Database URL` : Nécessaire pour remplir la base depuis votre PC.

---

## ⚙️ 3. ÉTAPE 2 : BACKEND NESTJS (RENDER)

1.  Créez un **Web Service** et liez votre dépôt GitHub.
2.  **Paramètres de Build & Deploy** :
    *   **Root Directory** : *(Laissez vide)*.
    *   **Environment** : `Node`.
    *   **Build Command** : `npm install --include=dev && npm run prisma:generate && npm run build:backend`.
    *   **Start Command** : `cd apps/backend && npm run start:prod`.
3.  **Variables d'Environnement** (Onglet *Environment*) :
    *   `DATABASE_URL` : Collez l'URL Interne de la base de données.
    *   `JWT_SECRET` : Une chaîne de caractères complexe (différente de votre local).
    *   `NODE_ENV` : `production`.
    *   `FRONTEND_URL` : URL finale de votre site Vercel (à mettre à jour à l'étape 4).

---

## 💻 4. ÉTAPE 3 : FRONTEND REACT (VERCEL)

1.  Importez votre dépôt sur Vercel.
2.  **Build and Output Settings** (Activez les Overrides) :
    *   **Root Directory** : *(Laissez vide)*.
    *   **Build Command** : `npm run build:frontend`.
    *   **Output Directory** : `apps/frontend/dist`.
    *   **Install Command** : `npm install`.
3.  **Variable d'Environnement** :
    *   `VITE_API_URL` : URL publique de votre API Render (sans slash final).
4.  **Routage** : Le fichier `vercel.json` déjà présent assure la gestion des routes React sans erreur 404.

---

## 🛠️ 5. ÉTAPE 4 : PEUPLEMENT DES DONNÉES (SEED)

L'accès au Shell étant restreint en mode gratuit sur Render, utilisez cette méthode à distance :

1.  Ouvrez `apps/backend/.env` sur votre **ordinateur local**.
2.  Remplacez temporairement `DATABASE_URL` par l'**External Database URL** de Render.
3.  Exécutez dans votre terminal : `npm run prisma:seed`.
4.  Une fois le succès confirmé, remettez votre URL locale dans votre fichier `.env`.

---

## 🚨 6. RÉSOLUTIONS DES PROBLÈMES RENCONTRÉS

| Incident | Cause | Solution appliquée |
| :--- | :--- | :--- |
| **Erreur TS7016** (`express`) | Dépendance `@types/express` manquante dans le paquet shared. | Ajout de `@types/express` dans les devDependencies de `shared-types`. |
| **Build failed** (commande `tsc`) | `NODE_ENV=production` ignore les outils de compilation. | Utilisation du drapeau `--include=dev` lors de l'installation npm. |
| **Types Prisma absents** | Build backend lancé avant la génération du client Prisma. | Ajout de `npm run prisma:generate` dans la Build Command de Render. |
| **Échec Connexion DB** | Tentative d'accès via URL interne (`dpg-...`) depuis le local. | Utilisation de l'**External Database URL** pour les opérations distantes. |
| **Erreur 401 au démarrage** | Absence de jeton d'authentification valide. | Comportement normal ; redirige vers la page de connexion. |

