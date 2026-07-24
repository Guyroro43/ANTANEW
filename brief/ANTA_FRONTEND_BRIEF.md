# ANTA — Brief Frontend & Design UI/UX
**Document destiné à Claude Code**
Version 1.0 — Juillet 2026

---

## 1. Contexte du projet

ANTA est une plateforme EdTech d'apprentissage de l'anglais pour la jeunesse africaine. Le projet est porté par un propriétaire (client), accompagné d'investisseurs, de professeurs (fournisseurs de contenu pédagogique) et d'un designer (charte graphique). Le développeur en charge est ANASSE Guy Roland Obodjé.

**ANTA n'est pas un acronyme et n'a pas de signification particulière.** Ne pas inventer de signification, ne pas développer le nom.

---

## 2. Mission de Claude Code

**Ne pas repartir de zéro.**

Avant toute modification, Claude Code doit :

1. Faire un audit complet du code existant — lire tous les fichiers, comprendre la structure, les composants déjà construits, les pages déjà faites, les dépendances installées
2. Identifier ce qui est déjà bien fait et le conserver
3. Identifier ce qui doit être revu en profondeur
4. Proposer un plan d'action avant de coder
5. Travailler de manière incrémentale — page par page, composant par composant

---

## 3. Question obligatoire avant de toucher au design

**Avant de coder quoi que ce soit lié aux couleurs ou à la typographie, Claude Code doit poser la question suivante au développeur :**

> "Est-ce que la charte graphique (couleurs, typographie, identité visuelle) a été fournie par le designer ? Si oui, envoie-la moi. Si non, je travaille avec des variables CSS en attente."

Ne jamais imposer une palette de couleurs sans validation. Utiliser des variables CSS (`--color-primary`, `--color-secondary`, etc.) en attendant la charte officielle.

---

## 4. Références de design obligatoires

Claude Code dispose d'un enregistrement d'écran fourni séparément. Il doit s'en servir comme référence principale.

### Version mobile — référence : Duolingo
- S'inspirer de la **disposition**, la **navigation**, la **structure des écrans** de l'application mobile Duolingo
- **Interdiction stricte** de copier les couleurs, les icônes, les avatars ou la mascotte de Duolingo
- Étudier : la barre de navigation du bas, la structure des leçons, les écrans de résultat, les animations entre questions, les cartes de modules, le système de streaks et XP affiché

### Version web — référence : iSpeakSpokeSpoken (ispeakspokespoken.com)
- S'inspirer du **layout**, de la **structure des sections**, de la **hiérarchie visuelle** du site
- **Interdiction stricte** de copier les couleurs, les icônes ou les éléments graphiques identitaires du site
- Étudier : la landing page, la disposition hero/sections, les cartes de cours, la navigation

---

## 5. Stack UI à utiliser

### Skills Claude Code
- **UI UX Pro Max** — skill installé, doit être utilisé en priorité
- Rechercher et combiner avec d'autres skills disponibles pertinents pour obtenir le meilleur rendu possible

### Animation
- **Motion** (anciennement Framer Motion) — déjà installé via `npm install motion`
  - Utiliser pour : transitions entre pages, animations de composants, enter/exit, layout animations, gestures
- **GSAP + @gsap/react** — déjà installé via `npm install gsap @gsap/react`
  - Utiliser pour : animations scroll-driven sur la landing page, révélations au scroll, animations de texte, séquences hero
- Les deux peuvent coexister sans conflit

### Typographie
- **Plus Jakarta Sans** — titres, boutons, éléments forts de l'interface
- **Inter** — corps de texte, labels, descriptions, données
- Charger via Google Fonts ou fontsource (préférer fontsource pour la performance)

### Icônes
- **Lucide React** ou **Phosphor Icons** — uniquement ces deux options
- Pas d'emojis comme icônes d'interface
- Pas d'icônes génériques Material UI ou FontAwesome

---

## 6. Exigences UI/UX non négociables

- **Zéro layout générique Claude.** Chaque page doit avoir une intention design claire et assumée
- **Ultra professionnel.** Le site et l'app doivent faire référence dans l'EdTech africaine
- **Mobile first absolu.** L'écrasante majorité des utilisateurs sont sur Android, connexion 3G/4G
- **Cohérence totale** entre la version web et la version mobile
- **Accessibilité** : contraste suffisant, tailles de police lisibles sur petit écran, zones de tap suffisamment grandes (minimum 44x44px)
- **Performance** : pas d'animations lourdes sur mobile, lazy loading sur les images, skeleton loaders sur les données asynchrones
- **Dark mode** : pris en charge sur toutes les pages
- **États complets** : chaque composant doit avoir un état normal, hover, focus, loading, vide et erreur

---

## 7. Pages à traiter

### Espace public
| Page | Route | Priorité |
|------|-------|----------|
| Landing page | `/` | Haute |
| Inscription | `/inscription` | Haute |
| Connexion | `/connexion` | Haute |
| Mot de passe oublié | `/mot-de-passe-oublie` | Moyenne |
| À propos | `/a-propos` | Basse |
| Contact | `/contact` | Basse |
| CGU | `/cgu` | Basse |
| Confidentialité | `/confidentialite` | Basse |

### Espace apprenant (connecté)
| Page | Route | Priorité |
|------|-------|----------|
| Dashboard | `/dashboard` | Haute |
| Liste des modules | `/modules` | Haute |
| Détail d'un module | `/modules/[slug]` | Haute |
| Session de leçon | `/lecon/[id]` | Haute |
| Classement | `/classement` | Moyenne |
| Collection de badges | `/badges` | Moyenne |
| Profil | `/profil` | Moyenne |
| Abonnement | `/abonnement` | Haute |
| Paramètres | `/parametres` | Basse |

### Espace admin
| Page | Route | Priorité |
|------|-------|----------|
| Dashboard admin | `/admin/dashboard` | Haute |
| Modules & Leçons | `/admin/modules` | Haute |
| Utilisateurs | `/admin/utilisateurs` | Moyenne |
| Abonnements | `/admin/abonnements` | Moyenne |

---

## 8. Comportements attendus par page

### Landing page `/`
- Hero avec image de fond (tigre), texte accrocheur, deux CTA (inscription + découvrir)
- Barre de stats animée au scroll (10 min/jour, 5 pays, +300 XP, 100% mobile)
- Section "Comment ça marche" : 4 étapes, révélation au scroll via GSAP
- Carrousel de modules avec animation image/texte (2s image → 5s texte en boucle)
- Toggle Gratuit/Premium pour filtrer les modules
- Section tarifs : plan Starter gratuit + plan Premium 5 000 FCFA/mois
- Carrousel de témoignages avec navigation manuelle
- CTA final + footer
- Navbar fixe avec logo, liens, bouton connexion, toggle dark mode

### Dashboard `/dashboard`
- Bannière de bienvenue personnalisée (prénom + niveau)
- Barre de progression globale
- Streak du jour mis en valeur
- XP total + niveau actuel
- Leçon recommandée du jour
- Raccourcis : Modules, Classement, Badges, Profil
- Structure inspirée de Duolingo mobile

### Session de leçon `/lecon/[id]`
- Barre de progression en haut (question X sur 5)
- Phase vocabulaire : carte mot + définition + exemple + audio
- Phase QCM : question + 4 options, chronomètre visible
- Feedback immédiat : animation correct (vert) / incorrect (rouge) avec explication
- Écran de résultat : score, XP gagné, badge si applicable, bouton continuer
- Transitions fluides entre les phases via Motion

### Admin dashboard `/admin/dashboard`
- Sidebar fixe (desktop) / burger menu (mobile)
- 4 cartes KPI : inscrits total, actifs 7 jours, Premium, revenu du mois
- Graphique d'activité
- Tableau des derniers inscrits
- Tableau des dernières transactions
- Fond distinctif de l'espace public (ne pas utiliser le même fond)

---

## 9. Standards de code

- **TypeScript strict** — pas de `any`, pas de `ts-ignore`
- **Composants réutilisables** — tout élément répété plus de 2 fois devient un composant
- **Pas de style inline** — uniquement Tailwind CSS
- **Nommage cohérent** — PascalCase pour les composants, camelCase pour les fonctions, kebab-case pour les fichiers de pages
- **Imports absolus** — utiliser `@/components/...` pas de `../../`
- **Séparation claire** — logique dans les hooks, UI dans les composants, appels Supabase dans les lib

---

## 10. Ce que Claude Code ne doit pas faire

- Ne pas réinventer l'arborescence — elle existe déjà
- Ne pas changer le stack technique sans validation
- Ne pas imposer une palette de couleurs sans la charte du designer
- Ne pas utiliser de librairies d'animation autres que Motion et GSAP
- Ne pas utiliser d'icônes autres que Lucide ou Phosphor
- Ne pas produire de layouts génériques ou de designs "template"
- Ne pas toucher aux fichiers Supabase (migrations, fonctions) sauf instruction explicite

---

*Brief rédigé par ANASSE Guy Roland Obodjé — Juillet 2026*
