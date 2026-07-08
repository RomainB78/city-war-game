# 🏰 Chroniques de la Boucle : Territoires et Conquêtes

Un jeu de stratégie multijoueur au tour par tour en temps réel, se déroulant dans la boucle de la Seine (Yvelines). Les joueurs s'affrontent pour le contrôle des bastions et des capitales de la région.

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-brightgreen?style=flat-square)](https://city-war-game-frontend.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-blue?style=flat-square)](https://render.com/)
[![Database-Supabase](https://img.shields.io/badge/Database-Supabase%20%26%20Prisma-darkblue?style=flat-square)](https://supabase.com/)

---

## 📜 Règles du Jeu

### Objectif
* Jeu de stratégie au tour par tour pour **2 joueurs**.
* Chaque joueur contrôle une faction composée de plusieurs villes et bastions.
* La partie est remportée lorsqu'une faction a **perdu toutes ses capitales**.

### Factions

#### 🔵 Faction Chatou (9 villes de départ)
* **Chatou** (Capitale) : 5 bastions de 5836 soldats
* **Croissy-sur-Seine** : 3 bastions de 3023 soldats
* **Houilles** : 4 bastions de 7551 soldats
* **Carrières-sur-Seine** : 5 bastions de 2996 soldats
* **Montesson** : 7 bastions de 1972 soldats
* **Le Mesnil-le-Roi** : 3 bastions de 1933 soldats
* **Bezons** : 4 bastions de 9108 soldats
* **Louveciennes** : 5 bastions de 1598 soldats
* **Marly-Le-Roi** : 7 bastions de 2393 soldats

#### 🔴 Faction Saint-Germain-en-Laye (10 villes de départ)
* **Saint-Germain-en-Laye** (Capitale) : 52 bastions de 854 soldats
* **Le Vésinet** : 5 bastions de 3129 soldats
* **Le Pecq** : 3 bastions de 5575 soldats
* **Port-Marly** : 2 bastions de 3894 soldats
* **Sartrouville** : 8 bastions de 6054 soldats
* **Maisons-Laffitte** : 7 bastions de 2393 soldats
* **Mareil-Marly** : 5 bastions de 3218 soldats
* **L'Étang-la-Ville** : 3 bastions de 5543 soldats
* **Chambourcy** : 2 bastions de 8954 soldats
* **Aigremont** : 4 bastions de 2145 soldats

---

## 🏗️ Architecture du Projet (Monorepo)

Le projet est structuré comme un monorepo NPM composé des packages suivants :

```
├── frontend/          # Application Next.js (Tailwind CSS, Lucide Icons, Socket.io-client)
├── backend/           # Serveur Node.js/Express + Socket.io + Prisma ORM
├── game-engine/       # Moteur de jeu de stratégie (calculs de combat, règles, tests unitaires)
├── shared/            # Types TypeScript, configurations des villes et adjacences partagées
├── map_editor.html    # Éditeur visuel interactif indépendant pour ajuster les polygones SVG
└── package.json       # Configuration des NPM Workspaces
```

---

## 🚀 Installation et Lancement Local

### Prérequis
* **Node.js** (v18+)
* **NPM** (v9+)
* Une base de données **PostgreSQL** (ex: Supabase, Docker, ou locale)

### 1. Installation des dépendances
À la racine du projet, lancez :
```bash
npm install
```

### 2. Base de données (Prisma)
Configurez vos variables d'environnement dans un fichier `backend/.env` :
```env
DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/nom_db"
```
Appliquez les migrations et générez le client Prisma :
```bash
npm run db:push --workspace=backend
```

### 3. Lancement des serveurs de développement
Pour lancer le backend et le frontend simultanément :
```bash
npm run dev
```
* **Frontend** : accessible sur [http://localhost:3000](http://localhost:3000)
* **Backend WebSocket** : accessible sur [http://localhost:3001](http://localhost:3001)

### 4. Lancement des tests unitaires
Pour exécuter les tests du moteur de jeu :
```bash
npm run test --workspace=game-engine
```

---

## 🛠️ Outil d'Édition Visuelle des Territoires

Si vous souhaitez redéfinir ou affiner les frontières des territoires cliquables de la carte :
1. Double-cliquez sur le fichier `map_editor.html` pour l'ouvrir dans votre navigateur.
2. Sélectionnez une ville dans la liste de gauche pour afficher ses sommets.
3. Glissez-déposez les poignées rouges pour modifier la forme du polygone en temps réel.
4. Double-cliquez sur la carte pour repositionner le badge d'informations (soldats/bastions) de la ville active.
5. Cliquez sur **💾 Copier la config React** pour obtenir l'objet `CITY_PATHS` mis à jour et collez-le directement dans `frontend/components/InteractiveMap.tsx`.

---

## 🌐 Déploiement

* **Frontend** : Déployé facilement sur **Vercel** avec détection automatique de Next.js.
* **Backend** : Déployé sur **Render** ou **Heroku**.
* **Base de données** : Hébergée sur **Supabase** avec **PgBouncer** activé (`pgbouncer=true` dans l'URL de connexion).
