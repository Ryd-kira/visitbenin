# 🚀 Guide de Déploiement — VisitBénin

> **Stack** : Frontend → Vercel | Backend → Koyeb | BDD → Neon

---

## Vue d'ensemble

```
┌─────────────────┐      HTTPS       ┌──────────────────────┐
│   Vercel         │ ─────────────► │   Koyeb               │
│  (frontend)      │                 │   (API Node.js)       │
│  visitbenin.app  │                 │   api.visitbenin.app  │
└─────────────────┘                 └──────────┬───────────┘
                                               │ SSL/Prisma
                                    ┌──────────▼───────────┐
                                    │   Neon (PostgreSQL)   │
                                    │   bdd.neon.tech       │
                                    └──────────────────────┘
```

---

## ÉTAPE 1 — Base de données sur Neon

### 1.1 Créer le projet Neon
1. Aller sur **https://neon.tech** → Sign up (gratuit)
2. **New Project** → Nom : `visitbenin` → Region : `EU Frankfurt`
3. Copier les deux URLs affichées :

```
Connection string (pooled) :
postgresql://visitbenin:<password>@ep-xxx-pooler.eu-central-1.aws.neon.tech/visitbenin_db?sslmode=require

Direct connection :
postgresql://visitbenin:<password>@ep-xxx.eu-central-1.aws.neon.tech/visitbenin_db?sslmode=require
```

### 1.2 Appliquer le schéma Prisma (depuis votre machine locale)

```bash
cd ~/Téléchargements/visitbenin/backend

# Créer un .env.local temporaire avec les URLs Neon
cat > .env.neon << 'EOF'
DATABASE_URL="postgresql://visitbenin:<password>@ep-xxx-pooler.eu-central-1.aws.neon.tech/visitbenin_db?sslmode=require"
DIRECT_URL="postgresql://visitbenin:<password>@ep-xxx.eu-central-1.aws.neon.tech/visitbenin_db?sslmode=require"
EOF

# Appliquer les migrations
npx dotenv -e .env.neon -- npx prisma migrate deploy

# OU si première fois (pas de dossier migrations/) :
npx dotenv -e .env.neon -- npx prisma db push

# Peupler avec les données de démo
npx dotenv -e .env.neon -- node prisma/seed.js
npx dotenv -e .env.neon -- node prisma/seed-events.js
npx dotenv -e .env.neon -- node prisma/seed-marketplace.js

# Nettoyer le fichier temporaire
rm .env.neon
```

> **Note** : Si `npx dotenv` n'est pas disponible → `npm i -g dotenv-cli` puis retenter

---

## ÉTAPE 2 — Backend sur Koyeb

### 2.1 Préparer le dépôt GitHub

Le backend doit être dans un dépôt GitHub (séparé ou monorepo).

**Option A — Monorepo (recommandé)** : pousser le dossier `visitbenin/` entier.

**Option B — Repo backend seul** :
```bash
cd ~/Téléchargements/visitbenin/backend
git init && git add . && git commit -m "init"
git remote add origin https://github.com/TON_USERNAME/visitbenin-api.git
git push -u origin main
```

### 2.2 Déployer sur Koyeb

1. Aller sur **https://www.koyeb.com** → Sign up (gratuit — 1 instance nano incluse)
2. **Create App** → **GitHub** → Sélectionner votre repo

**Configuration du service** :

| Champ | Valeur |
|---|---|
| Service name | `visitbenin-api` |
| Branch | `main` |
| Build command | `cd backend && npm ci && npm run build` |
| Run command | `cd backend && npx prisma migrate deploy && npm start` |
| Port | `3001` |
| Instance | `Nano (free)` |
| Region | `Frankfurt` |

> Si repo backend seul (pas monorepo), enlever le `cd backend &&`

### 2.3 Variables d'environnement Koyeb

Dans **Settings → Environment Variables**, ajouter :

```
NODE_ENV              = production
DATABASE_URL          = postgresql://visitbenin:<pw>@ep-xxx-pooler.neon.tech/visitbenin_db?sslmode=require
DIRECT_URL            = postgresql://visitbenin:<pw>@ep-xxx.neon.tech/visitbenin_db?sslmode=require
JWT_ACCESS_SECRET     = [générer : openssl rand -base64 64]
JWT_REFRESH_SECRET    = [générer : openssl rand -base64 64]
FRONTEND_URL          = https://visitbenin.vercel.app        ← à remplir après étape 3
ADMIN_URL             = https://visitbenin-admin.vercel.app  ← à remplir après étape 3
ANTHROPIC_API_KEY     = sk-ant-...                           ← optionnel, pour le chatbot
```

**Générer des secrets forts** (dans votre terminal) :
```bash
openssl rand -base64 64   # copier-coller pour JWT_ACCESS_SECRET
openssl rand -base64 64   # copier-coller pour JWT_REFRESH_SECRET
```

### 2.4 Vérifier le déploiement

Une fois déployé, Koyeb vous donne une URL type :
`https://visitbenin-api-xxxx.koyeb.app`

Tester :
```bash
curl https://visitbenin-api-xxxx.koyeb.app/health
# Réponse attendue : {"status":"ok","timestamp":"..."}
```

Noter cette URL — elle sera `VITE_API_URL` pour Vercel.

---

## ÉTAPE 3 — Frontend sur Vercel

### 3.1 Déployer le frontend

1. Aller sur **https://vercel.com** → Sign up avec GitHub
2. **Add New Project** → Importer votre repo GitHub

**Configuration build** :

| Champ | Valeur |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3.2 Variables d'environnement Vercel (frontend)

Dans **Settings → Environment Variables** :

```
VITE_API_URL = https://visitbenin-api-xxxx.koyeb.app/api/v1
```

> Remplacer `xxxx` par votre vraie URL Koyeb

### 3.3 Domaine personnalisé (optionnel)

**Settings → Domains** → Ajouter `visitbenin.bj` ou `visitbenin.vercel.app`

---

## ÉTAPE 4 — Admin sur Vercel

Même procédure que le frontend, avec :

| Champ | Valeur |
|---|---|
| Root Directory | `admin` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Variable d'environnement :
```
VITE_API_URL = https://visitbenin-api-xxxx.koyeb.app/api/v1
```

---

## ÉTAPE 5 — Mettre à jour le CORS

Une fois les URLs Vercel connues, retourner dans Koyeb → Variables d'environnement et mettre à jour :

```
FRONTEND_URL = https://visitbenin.vercel.app
ADMIN_URL    = https://visitbenin-admin.vercel.app
```

Koyeb redéployera automatiquement.

---

## Checklist finale ✅

```
□ Neon : base de données créée et migrée
□ Neon : données de seed chargées (seed.js + seed-events.js + seed-marketplace.js)
□ Koyeb : backend déployé et /health accessible
□ Koyeb : toutes les variables d'environnement renseignées
□ Vercel frontend : VITE_API_URL pointe vers Koyeb
□ Vercel admin : VITE_API_URL pointe vers Koyeb
□ Koyeb : FRONTEND_URL et ADMIN_URL mis à jour avec les URLs Vercel
□ Test : login avec superadmin@visitbenin.bj / Pendjari$2025!
□ Test : créer un voyage dans le planificateur
□ Test : chatbot Akofa répond
```

---

## Résolution des problèmes courants

### ❌ "CORS blocked"
→ Vérifier que `FRONTEND_URL` dans Koyeb correspond **exactement** à l'URL Vercel (sans slash final)

### ❌ "Invalid refresh token" après login
→ Les cookies `SameSite=None` nécessitent **HTTPS**. S'assurer que les deux domaines sont en HTTPS (c'est automatique avec Vercel + Koyeb)

### ❌ Prisma "Environment variable not found: DIRECT_URL"
→ Ajouter `DIRECT_URL` dans les variables Koyeb (même valeur que `DATABASE_URL` mais sans `-pooler`)

### ❌ "Cannot connect to database" au démarrage Koyeb
→ Vérifier que l'URL Neon contient bien `?sslmode=require`

### ❌ Page blanche sur Vercel (routes React)
→ Le fichier `vercel.json` doit être présent dans `frontend/` avec les rewrites SPA (déjà configuré)

---

## Architecture des coûts (plan gratuit)

| Service | Plan | Limites |
|---|---|---|
| **Neon** | Free | 0.5 GB stockage, 1 compute unit |
| **Koyeb** | Free | 1 instance nano, 256 MB RAM, 0.1 vCPU |
| **Vercel** | Hobby | 100 GB bandwidth, deployments illimités |
| **Total** | **0 €/mois** | Suffisant pour un MVP |

> Pour la production avec du trafic réel : Neon Launch (~19$/mois), Koyeb Starter (~5$/mois)

---

## Commandes utiles post-déploiement

```bash
# Voir les logs Koyeb en temps réel
koyeb service logs visitbenin-api --follow

# Ouvrir Prisma Studio sur la BDD Neon (depuis local)
DATABASE_URL="<neon_url>" npx prisma studio

# Relancer un déploiement Koyeb
koyeb service redeploy visitbenin-api

# Vérifier le statut de toutes les instances
koyeb service list
```

