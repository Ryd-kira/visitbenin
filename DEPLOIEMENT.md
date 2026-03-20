# 🚀 Guide de Déploiement — VisitBénin

> Stack : Frontend/Admin → Vercel | Backend → Render | BDD → Neon

---

## Architecture

```
Vercel (frontend)  ──HTTPS──►  Render (API Node.js)  ──►  Neon (PostgreSQL)
visitbenin.vercel.app          visitbenin-api.onrender.com
```

---

## ÉTAPE 1 — GitHub (prérequis)

### Pousser le projet

```bash
cd ~/Téléchargements/visitbenin

git init
git add .
git commit -m "VisitBénin v1.0"
git branch -M main
```

Créer le repo sur github.com, puis :

```bash
# Avec token (Settings → Developer settings → Personal access tokens → Tokens classic → repo)
git remote add origin https://VOTRE_USERNAME:VOTRE_TOKEN@github.com/VOTRE_USERNAME/visitbenin.git
git push -u origin main
```

---

## ÉTAPE 2 — Neon (base de données)

1. https://neon.tech → Sign up → **New Project**
   - Name : `visitbenin`
   - Database : `visitbenin_db`
   - Region : `EU Frankfurt`

2. Dashboard Neon → **Connection Details** → sélectionner **Prisma** dans le menu déroulant

3. Copier les deux URLs affichées

4. Appliquer le schéma depuis votre machine :

```bash
cd ~/Téléchargements/visitbenin/backend

# Créer le .env temporaire avec vos vraies URLs Neon
cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://user:password@host-pooler.neon.tech/visitbenin_db?sslmode=require"
DIRECT_URL="postgresql://user:password@host.neon.tech/visitbenin_db?sslmode=require"
ENVEOF

# Appliquer le schéma
npx prisma@5 db push

# Charger les données
node prisma/seed.js
node prisma/seed-events.js
node prisma/seed-marketplace.js

# Supprimer le .env (sera recréé proprement après)
rm .env
```

---

## ÉTAPE 3 — Render (backend)

1. https://render.com → Sign up avec GitHub

2. **New** → **Web Service** → Connecter votre repo GitHub `visitbenin`

3. Configuration :

| Champ | Valeur |
|---|---|
| Name | `visitbenin-api` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Branch | `main` |
| Build Command | `npm install && npm run build` |
| Start Command | `npx prisma@5 migrate deploy && npm start` |
| Instance Type | `Free` |
| Region | `Frankfurt (EU Central)` |

4. Variables d'environnement (cliquer **Add Environment Variable** pour chacune) :

| Clé | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `20.11.0` |
| `DATABASE_URL` | URL pooler Neon |
| `DIRECT_URL` | URL directe Neon |
| `JWT_ACCESS_SECRET` | `openssl rand -base64 64` |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 64` |
| `JWT_ACCESS_EXPIRES` | `15m` |
| `JWT_REFRESH_EXPIRES` | `7d` |
| `FRONTEND_URL` | `https://visitbenin.vercel.app` (à corriger après Vercel) |
| `ADMIN_URL` | `https://visitbenin-admin.vercel.app` (à corriger après Vercel) |
| `ANTHROPIC_API_KEY` | Votre clé Claude (optionnel) |

5. Cliquer **Create Web Service** → attendre le déploiement (~3 min)

6. Tester :
```bash
curl https://visitbenin-api.onrender.com/health
# {"status":"ok"}
```

> ⚠️ Sur le plan gratuit Render, le service s'endort après 15 min d'inactivité.
> Le premier appel après inactivité prend ~30 secondes (cold start).

---

## ÉTAPE 4 — Vercel (frontend)

1. https://vercel.com → Sign up avec GitHub → **Add New Project** → importer `visitbenin`

2. Configuration :

| Champ | Valeur |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. Variable d'environnement :
```
VITE_API_URL = https://visitbenin-api.onrender.com/api/v1
```

4. Cliquer **Deploy**

---

## ÉTAPE 5 — Vercel (admin)

Même procédure, avec :

| Champ | Valeur |
|---|---|
| Root Directory | `admin` |

Variable d'environnement :
```
VITE_API_URL = https://visitbenin-api.onrender.com/api/v1
```

---

## ÉTAPE 6 — Mettre à jour le CORS sur Render

Une fois les URLs Vercel connues, dans Render → **Environment** → mettre à jour :

```
FRONTEND_URL = https://visitbenin-xxx.vercel.app
ADMIN_URL    = https://visitbenin-admin-xxx.vercel.app
```

Render redéploie automatiquement.

---

## Checklist

```
□ GitHub : projet poussé sur main
□ Neon : BDD créée et schéma appliqué (prisma db push)
□ Neon : seeds chargés (seed.js + seed-events.js + seed-marketplace.js)
□ Render : service déployé, /health répond {"status":"ok"}
□ Render : toutes les variables d'env renseignées
□ Vercel frontend : VITE_API_URL = URL Render
□ Vercel admin : VITE_API_URL = URL Render
□ Render : FRONTEND_URL et ADMIN_URL mis à jour
□ Test login : superadmin@visitbenin.bj / Pendjari$2025!
□ Test carte interactive
□ Test chatbot Akofa
```

---

## Erreurs fréquentes

### CORS bloqué
→ FRONTEND_URL dans Render ne correspond pas exactement à l'URL Vercel (sans slash final)

### Déconnexion après refresh
→ Vérifier NODE_ENV=production dans Render

### P1001 : Can't reach database
→ Essayer avec uniquement l'URL pooler pour DATABASE_URL et DIRECT_URL

### Page blanche sur Vercel
→ Vérifier que frontend/vercel.json existe avec les rewrites SPA

### Cold start lent (30s)
→ Normal sur plan gratuit Render. Solution : passer au plan Starter (7$/mois)
   ou utiliser un service de ping toutes les 14 min (ex: UptimeRobot gratuit)
