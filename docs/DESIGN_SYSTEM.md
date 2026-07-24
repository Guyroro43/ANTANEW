# ANTA — Design System

Spec de référence pour toute nouvelle UI sur le projet (web). À respecter par défaut ; toute déviation doit être délibérée et documentée ici.

## Fondation technique

- **shadcn/ui** (composants Radix UI + Tailwind, copiés dans `src/components/ui/`) — approche par composant, pas de librairie boîte noire.
- **Tailwind v4** (config CSS-first, pas de `tailwind.config.ts` — tout vit dans `src/app/globals.css` via `@theme inline`).
- **class-variance-authority (CVA)** pour les variantes de composants.
- **lucide-react** pour les icônes (seule librairie d'icônes autorisée).
- Dark mode : classe `.dark` sur `<html>` (pas de media query), piloté par `themeStore`/`ThemeToggle` existants.

## Couleurs

Identité de marque appliquée directement aux tokens shadcn (pas de neutre générique) :

| Token | Valeur | Usage |
|---|---|---|
| `primary` | `#dc2626` (rouge ANTA) | Actions principales, liens, focus — **identique en light et dark mode** |
| `secondary` | `#16a34a` (vert ANTA) | Actions secondaires |
| `accent` | `#facc15` (jaune ANTA) | Mise en avant ponctuelle |
| `success` | = `secondary` (vert) | États de succès (badges, messages) |
| `warning` | = `accent` (jaune) | États d'attention |
| `destructive` | rouge shadcn par défaut | Suppression, erreurs, danger |
| `background` / `foreground` / `card` / `popover` / `muted` / `border` / `input` / `ring` | gris neutres shadcn (oklch) | Structure, texte, séparateurs |

Tous ces tokens sont définis en `oklch()`/hex dans `:root` et `.dark` (`src/app/globals.css`), puis exposés comme utilities Tailwind (`bg-primary`, `text-success`, etc.) via le bloc `@theme inline`.

**Ne jamais coder une couleur en dur** (`bg-red-600`, `text-[#facc15]`…) dans une page ou un composant produit — toujours passer par les tokens (`bg-primary`, `text-destructive`, …) pour que theming et dark mode restent cohérents.

## Forme

- Radius resserré, valeur shadcn par défaut (`--radius: 0.625rem`) — **pas** les coins très arrondis (1.25–2rem) ni les boutons pilule de l'ancienne UI.
- Pas de dégradés d'arrière-plan systématiques sur les cartes/sections — fonds plats (`bg-card`, `bg-background`), rendu épuré.

## Typographie

- Titres (`h1`–`h6`) : Plus Jakarta Sans (`--font-heading`, poids 500–800).
- Corps de texte : Inter (`--font-sans`).
- Définis via `next/font/google` dans `src/app/layout.tsx`.

## Composants

### Ajouter un nouveau composant shadcn
```
npx shadcn@latest add <nom> -o
```
Le `-o` (overwrite) est nécessaire : sur Windows (filesystem insensible à la casse), un composant shadcn en minuscules (`card.tsx`) peut entrer en collision avec un fichier existant en PascalCase — toujours vérifier après coup que le fichier résultant est bien en **minuscules** (`ls src/components/ui/`), et corriger avec un `git mv` en deux temps si besoin (`Foo.tsx` → `__tmp.tsx` → `foo.tsx`).

**Après avoir ajouté un composant basé sur Radix** (avatar, dialog, dropdown-menu, label, progress, select, separator, switch, tabs, tooltip, ou tout futur composant Radix), deux étapes obligatoires :
1. Remplacer l'import du paquet unifié `radix-ui` par le paquet individuel correspondant (`import * as XPrimitive from "@radix-ui/react-x"` au lieu de `import { X as XPrimitive } from "radix-ui"`) — le paquet unifié casse `next build` (voir point suivant).
2. Ajouter ce paquet individuel à `experimental.serverComponentsExternalPackages` dans `next.config.js`.

Sans ces deux étapes, `npm run dev` fonctionne normalement mais **`npm run build` échoue** avec `TypeError: n.createContext is not a function` pendant `Collecting page data` — Next.js 14.2.x tente d'évaluer le code de création de contexte de Radix (appelé au chargement du module) dans l'environnement React restreint des Server Components, où `createContext` n'existe pas. Le bug touche une page prise au hasard dans TOUT le projet (pas forcément celle qui vient d'être modifiée) — si ça revient après l'ajout d'un composant, c'est cette check-list qu'il faut revérifier en premier, pas autre chose.

### Étendre une variante (ex: success/warning)
Ajouter la variante directement dans le fichier CVA du composant (`badgeVariants`, `buttonVariants`, etc.) plutôt que de créer un composant parallèle. Voir `src/components/ui/badge.tsx` pour l'exemple `success`/`warning`.

### Wrappers ANTA (composition, pas des forks)
Certains besoins produits récurrents sont couverts par de petits composants qui **composent** les primitives shadcn plutôt que de les modifier :
- `src/components/ui/field-input.tsx` (`FieldInput`) — `Label` + `Input` avec la prop `label` pratique utilisée dans tous les formulaires admin.
- `src/components/ui/user-avatar.tsx` (`UserAvatar`) — `Avatar`/`AvatarImage`/`AvatarFallback` avec une API `name`/`src`/`size` (px) + initiales auto-générées.

Préférer ce pattern (nouveau petit composant qui compose) à la modification des fichiers générés par shadcn, qui seront écrasés au prochain `add --overwrite`.

### Composants encore hérités (non migrés)
`Icon.tsx`, `Modal.tsx`, `ProgressBar.tsx`, `Reveal.tsx`, `Slider.tsx`, `Spinner.tsx`, `Toggle.tsx` dans `src/components/ui/` sont l'ancienne UI, pas encore remplacés. Migration incrémentale à faire **au fil de l'eau** quand une page les utilisant est retouchée — pas de big-bang :
- `Modal` → `Dialog` (ou `Sheet` pour un panneau latéral/mobile)
- `ProgressBar` → `Progress`
- `Toggle` → `Switch`
- `Icon`, `Reveal`, `Spinner` : pas d'équivalent shadcn direct, à garder tels quels pour l'instant.

## Ce qui a changé (contexte)

Avant juillet 2026, l'UI était un système de composants maison (Tailwind utility-first pur, coins très arrondis, dégradés, palette rouge/jaune/vert appliquée de façon ad hoc). Passage à shadcn/ui + Tailwind v4 pour un système de composants plus rigoureux et un rendu plus épuré, tout en gardant l'identité de marque (rouge/vert/jaune) au niveau des tokens plutôt que codée en dur.
