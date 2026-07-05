# ANTA — African Native Tongue Academy

Plateforme EdTech d'apprentissage de l'anglais pour la jeunesse africaine.

## Prérequis

- Node.js 18+
- Compte [Supabase](https://supabase.com)

## Installation

```bash
npm install
cp .env.example .env.local
# Remplis .env.local avec tes clés Supabase
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Configuration Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Va dans **SQL Editor** et exécute le fichier `supabase/migrations/001_initial_schema.sql`
3. Va dans **Project Settings > API** et copie :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Dans **Authentication > URL Configuration**, ajoute :
   - Site URL : `http://localhost:3000`
   - Redirect URLs : `http://localhost:3000/auth/callback`
5. (Optionnel) Active **Google** dans **Authentication > Providers**

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Serveur production |

## Structure

- `src/app/(public)/` — Landing, inscription, connexion
- `src/app/dashboard/` — Espace apprenant
- `src/components/auth/` — Formulaires d'authentification
- `supabase/migrations/` — Schéma base de données
