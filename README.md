# 🌍 VisitBénin — Plateforme Touristique Nationale

Plateforme web complète pour le Bénin : touristes, expatriés, familles. Monorepo React + Node.js + PostgreSQL.

---

## 📦 Structure

```
visitbenin/
├── frontend/     # React 18 + Vite 5       → http://localhost:5173
├── admin/        # Back-office React        → http://localhost:5174
├── backend/      # Node.js 20 + Express 5  → http://localhost:3001
├── docker-compose.yml
└── package.json  # Workspaces npm
```

---

## 🚀 Installation

### 1. Prérequis
- Node.js 20+
- PostgreSQL 15+
- Redis (optionnel)

### 2. Base de données

```bash
sudo systemctl start postgresql

sudo -u postgres psql << 'SQL'
CREATE USER visitbenin WITH PASSWORD 'password';
CREATE DATABASE visitbenin_db OWNER visitbenin;
GRANT ALL PRIVILEGES ON DATABASE visitbenin_db TO visitbenin;
ALTER USER visitbenin CREATEDB;
SQL
```

### 3. Variables d'environnement

```bash
cp backend/.env.example backend/.env
```

Éditer `backend/.env` — **IMPORTANT** : utiliser `127.0.0.1` et non `localhost` pour PostgreSQL :

```env
DATABASE_URL="postgresql://visitbenin:password@127.0.0.1:5432/visitbenin_db"
PORT=3001
JWT_ACCESS_SECRET=votre_secret_tres_long
JWT_REFRESH_SECRET=votre_autre_secret_long

# Chatbot Akofa (optionnel)
ANTHROPIC_API_KEY=sk-ant-votre_cle_ici
```

### 4. Installation des dépendances

```bash
npm install          # racine (workspaces)
cd frontend && npm install
cd ../admin && npm install
cd ../backend && npm install
```

### 5. Migrations et seed

```bash
cd backend

# Schéma Prisma → BDD
npx prisma migrate dev --name init

# Ou si la BDD existe déjà :
npx prisma db push

# Migrations manuelles (si nécessaire)
npm run migrate:bookings     # Table réservations
npm run migrate:marketplace  # Tables marketplace

# Données de démo
npm run seed             # Données principales
npm run seed:events      # 13 fêtes béninoises
npm run seed:marketplace # 5 boutiques + 16 produits
```

### 6. Démarrage

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — Admin
cd admin && npm run dev
```

---

## 🔐 Compte admin

```
Email    : superadmin@visitbenin.bj
Password : Pendjari$2025!
```

---

## 🗺️ Pages frontend (20 routes)

| Route | Page |
|---|---|
| `/` | Accueil |
| `/destinations` | Liste des sites |
| `/destinations/:slug` | Fiche lieu |
| `/gastronomie` | Liste restaurants |
| `/gastronomie/:slug` | Fiche restaurant |
| `/ecoles` | Liste écoles |
| `/ecoles/:slug` | Fiche école |
| `/carte` | Carte interactive avancée |
| `/sinstaller` | Guide expatrié |
| `/planifier` | Planificateur de voyage |
| `/itineraires` | Itinéraires suggérés |
| `/calendrier` | Calendrier fêtes & cérémonies |
| `/ecotourisme` | Éco-tourisme |
| `/infos-pratiques` | Visa, transport, santé |
| `/partenaires` | Agences & partenaires |
| `/marketplace` | MissèBo Market |
| `/dashboard` | Espace utilisateur (6 onglets) |
| `/connexion` | Connexion |
| `/inscription` | Inscription |

---

## 🔌 API Backend (15 routes)

| Endpoint | Description |
|---|---|
| `POST /api/v1/auth/*` | Auth JWT (login, register, refresh, logout) |
| `GET/POST /api/v1/places` | Destinations |
| `GET/POST /api/v1/restaurants` | Restaurants |
| `GET/POST /api/v1/schools` | Écoles |
| `GET/POST /api/v1/reviews` | Avis utilisateurs |
| `GET/PATCH /api/v1/users/me` | Profil utilisateur |
| `GET /api/v1/users/me/saved` | Favoris |
| `GET /api/v1/users/me/trips` | Voyages |
| `GET /api/v1/users/me/reviews` | Mes avis |
| `GET/POST /api/v1/trips` | Planificateur |
| `GET/POST /api/v1/activities` | Activités |
| `GET/POST /api/v1/rentals` | Locations |
| `GET/POST /api/v1/events` | Événements & fêtes |
| `GET/POST /api/v1/bookings` | Réservations |
| `GET/POST /api/v1/marketplace/*` | Shops, produits, commandes |
| `POST /api/v1/chatbot/message` | Chatbot Akofa (Claude API) |
| `GET /api/v1/chatbot/suggestions` | Suggestions contextuelles |
| `POST /api/v1/upload` | Upload média (Cloudinary) |

---

## 🛒 Marketplace

### Lancer le seed

```bash
cd backend
npm run seed:marketplace
```

Crée 5 boutiques + 16 produits :
- **Marché MissèBo** — huile de palme, sodabi, crevettes fumées
- **Atelier Abomey Bronze** — bas-reliefs, statuettes vodun, masques Gelede
- **Épices & Saveurs** — nétété, maniguette, mélanges
- **Kita Couture** — pagnes tissés, boubous, wax Vlisco
- **Poterie Natitingou** — jarres, bols Betammaribé

### Paiement

- MTN Mobile Money
- Moov Money
- Espèces à la livraison

---

## 🧕🏾 Chatbot Akofa

Guide touristique virtuel propulsé par Claude (Anthropic).

**Activer le chatbot** : ajouter `ANTHROPIC_API_KEY` dans `backend/.env`.

Sans clé API, le chatbot fonctionne en mode dégradé (message de fallback).

**Fonctionnalités** :
- Suggestions contextuelles par page
- Historique de conversation
- Connaît toutes les destinations, fêtes, cuisine béninoise
- Répond en FR/EN selon la langue du visiteur

---

## 🌍 Internationalisation (i18n)

4 langues supportées : **Français**, **English**, **Español**, **Português**

```bash
cd frontend
npm install  # installe i18next + react-i18next + i18next-browser-languagedetector
```

La langue est détectée automatiquement depuis le navigateur et sauvegardée dans `localStorage` (clé : `visitbenin_lang`).

**Sélecteur** : bouton flottant en bas à gauche + menu déroulant dans la navbar.

**Ajouter une traduction** : éditer les fichiers dans `frontend/src/i18n/locales/{fr,en,es,pt}/common.json`.

---

## 📅 Réservations

Le système de réservation permet de réserver :
- Visites guidées sur les fiches Destinations
- Tables dans les restaurants
- Activités et locations (bientôt)

**Backend** : `POST /api/v1/bookings` + `GET /api/v1/bookings/me`

**Paiement** : MTN Money, Moov Money, carte, espèces

---

## 🗓️ Calendrier

13 fêtes et cérémonies béninoises :
- Fête du Vodun (10 janvier, Ouidah)
- Gani de Nikki
- Gaani de Djougou
- Nonvitcha d'Abomey
- Zangbeto
- Fête des Ignames
- FITHEB
- Safari Pendjari
- … et plus

```bash
npm run seed:events  # dans /backend
```

---

## 🗺️ Carte Interactive

- Filtres par catégorie (Sites, Restaurants, Écoles)
- Filtres par type de site (Culture, Nature, Safari, Plage…)
- Navigation rapide par ville (8 villes)
- Recherche instantanée
- Panneau latéral avec fiche détaillée
- Pop-up avec photo et lien vers la fiche complète
- Fond de carte sombre (CartoDB Dark Matter)

---

## 🎨 Design System

```
Couleurs :
  Or       #C8922A   → accent principal
  Terracotta #C4501E → culture & sites
  Vert     #3A6B47   → nature & éco
  Nuit     #0E0A06   → fond foncé
  Sable    #F5EDD6   → texte clair
  Brun     #3D2B10   → secondaire

Fonts :
  Playfair Display → titres
  DM Sans          → corps
  Bebas Neue       → décoratif
  IBM Plex Mono    → admin
```

---

## 📋 Scripts utiles

```bash
# Backend
npm run dev              # Démarrer en dev (nodemon)
npm run seed             # Seed complet
npm run seed:events      # Fêtes béninoises
npm run seed:marketplace # Boutiques & produits
npm run migrate:bookings     # Migration table bookings
npm run migrate:marketplace  # Migration tables marketplace

# Frontend
npm run dev     # Vite dev server
npm run build   # Build production
npm run preview # Prévisualisation du build

# Admin
npm run dev     # Port 5174
npm run build   # Build production
```

---

## 🛡️ Sécurité

- JWT access token (15min, en mémoire)
- JWT refresh token (7j, cookie httpOnly + SameSite=Strict)
- Rate limiting : 10 tentatives login / 15min, 300 req/15min global
- CORS configuré pour les origines frontend/admin uniquement
- Helmet.js, express-validator

---

## 📊 Admin Back-office

Routes disponibles dans l'admin (port 5174) :

| Route | Section |
|---|---|
| `/dashboard` | KPIs & graphiques |
| `/places` | Destinations |
| `/restaurants` | Restaurants |
| `/schools` | Écoles |
| `/partners` | Partenaires |
| `/trips` | Voyages planifiés |
| `/activities` | Activités |
| `/rentals` | Locations |
| `/events` | Calendrier & Fêtes |
| `/bookings` | Réservations |
| `/marketplace` | Boutiques & Commandes |
| `/reviews` | Avis utilisateurs |
| `/users` | Gestion utilisateurs |
| `/media` | Médiathèque |

---

## 🗃️ Schéma Base de données

16 tables : `users`, `refresh_tokens`, `cities`, `places`, `restaurants`, `schools`, `hotels`, `reviews`, `saved_items`, `events`, `partners`, `trips`, `trip_steps`, `activities`, `rentals`, `bookings`, `shops`, `products`, `orders`, `order_items`

---

© 2025 VisitBénin — Akpé 🌍
