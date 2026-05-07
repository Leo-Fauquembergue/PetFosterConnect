# 🚀 Guide de la Pipeline CI (GitHub Actions)

Ce projet utilise désormais **GitHub Actions** pour garantir la qualité du code et la stabilité des déploiements.

## 🛠️ Fonctionnement
La pipeline s'exécute automatiquement dans les cas suivants :
- **Push** sur n'importe quelle branche.
- **Pull Request / Merge Request** vers la branche `main`.

## 📋 Étapes de validation
À chaque exécution, les étapes suivantes sont réalisées dans l'ordre :
1. **Linting & Formatting :** Vérification via Biome pour un code propre.
2. **Types Partagés :** Build de `@projet/shared-types`.
3. **Prisma :** Génération du client Prisma pour le typage backend.
4. **Type-check :** Validation TypeScript sur l'ensemble du monorepo.
5. **Tests :** Exécution des tests unitaires Frontend (Vitest) et Backend (Jest).
6. **Build :** Compilation finale du Backend et du Frontend.

## 🚦 Interpréter les résultats
- ✅ **Vert :** Le code est stable et prêt à être mergé/déployé.
- ❌ **Rouge :** Une étape a échoué. Cliquez sur le badge rouge dans GitHub pour voir les logs et corriger l'erreur.

## 🔒 Sécuriser la branche principale (Conseillé)
Pour une protection maximale, activez les **Branch Protection Rules** sur `main` dans GitHub :
1. `Settings` > `Branches` > `Add rule`.
2. Pattern : `main`.
3. Cocher : `Require status checks to pass before merging`.
4. Rechercher et ajouter : `Build and Test`.

---
*Ce système garantit que Render et Vercel ne déploient que du code validé.*
