# ANTA — Brief Refonte Système Administration Multi-Rôles
**Document destiné à Claude Code**
Version 1.0 — Juillet 2026

---

## 1. Contexte

Le système admin actuel est à remplacer intégralement par une architecture multi-rôles. Il y a 4 niveaux d'accès distincts, chacun avec son propre dashboard, ses propres permissions et son propre espace visuel.

**Avant toute modification, Claude Code doit :**
1. Lire tout le code existant dans `src/app/admin/`
2. Lire les migrations existantes dans `supabase/migrations/`
3. Comprendre ce qui est déjà en place
4. Proposer un plan d'action avant de coder

---

## 2. Les 4 rôles

| Rôle | Valeur en base | Description |
|------|---------------|-------------|
| Instructeur | `instructor` | Contrôle absolu sur le volet éducatif |
| Fondateur | `founder` | Vue économique et synthétique |
| Fondateur-Instructeur | `founder_instructor` | Cumul des deux rôles avec bascule |
| Développeur | `developer` | Admin absolu — accès total |

---

## 3. Instructeur

### Périmètre
Contrôle absolu sur le volet éducatif. Plusieurs instructeurs peuvent coexister sur la plateforme.

### Permissions
- Créer, modifier, supprimer des modules et des leçons
- Ajouter et remplacer l'image d'un module (style carte visuelle — voir images fournies séparément)
- Organiser l'ordre des modules par drag and drop
- Assigner un autre instructeur à l'un de ses modules (accès accordé par le créateur du module uniquement)
- Valider les évaluations des apprenants avec assistance IA
- Accès complet aux statistiques apprenants

### Dashboard instructeur — contenu complet
**Vue globale**
- Nombre total d'apprenants actifs (7 derniers jours)
- Nombre de leçons complétées aujourd'hui / cette semaine / ce mois
- Taux de complétion moyen par module
- Modules les plus consultés (top 5)
- Modules les moins consultés (bottom 3 — signaux d'amélioration)

**Statistiques par module**
- Nombre d'apprenants ayant démarré le module
- Nombre d'apprenants ayant complété le module
- Score moyen par leçon
- Question la plus souvent ratée dans chaque leçon
- Temps moyen passé par leçon

**Statistiques apprenants**
- Liste des apprenants avec : prénom, niveau XP, dernière connexion, modules en cours, taux de complétion global
- Filtres : actifs / inactifs / Premium / Starter / par pays
- Courbe d'activité quotidienne (30 derniers jours)
- Classement des apprenants par XP

**Évaluations**
- Liste des évaluations en attente de validation
- Interface de validation avec suggestion IA
- Historique des évaluations validées

### Gestion des modules
- Page liste : cartes visuelles (image en fond, titre en overlay, badge difficulté, nombre de leçons, statut publié/non publié)
- Clic sur une carte → page d'édition du module
- Page d'édition : titre, description, image, ordre, difficulté, statut, liste des leçons, assignation d'instructeurs
- Page leçon : titre, contenu, questions QCM, audio, note culturelle

### Messagerie
- Peut envoyer des messages à tous les rôles
- Reçoit les messages des fondateurs et du développeur
- Badge notification sur l'icône messagerie

---

## 4. Fondateur

### Périmètre
Vue de pilotage — volet économique principal et synthèse éducative. Peut être plusieurs fondateurs.

### Dashboard fondateur — contenu complet

**Volet économique — avec sélecteur de période (aujourd'hui / 7j / 30j / 3 mois / 1 an / personnalisé)**
- Revenu total sur la période
- Nombre de nouveaux inscrits
- Nombre de nouveaux comptes Premium
- Taux de conversion Starter → Premium
- Courbe de croissance du revenu
- Courbe de croissance des inscrits
- Revenu moyen par utilisateur (ARPU)
- Taux de rétention (apprenants encore actifs après 30 jours)

**Volet éducatif — synthèse**
- Nombre de modules publiés
- Nombre de leçons totales
- Nombre d'apprenants actifs
- Top 3 modules les plus suivis

**Apprenants**
- Peut voir les noms et emails des apprenants
- Tableau apprenants avec : prénom, email, pays, statut abonnement, date d'inscription
- Filtres par statut et par pays

**Messagerie**
- Peut envoyer des messages à tous les rôles (instructeurs, développeur, autres fondateurs)
- Reçoit les messages de tous les rôles

---

## 5. Fondateur-Instructeur

Cumule exactement les deux dashboards décrits ci-dessus.

**Bascule de rôle**
- Bouton dans la navbar : `Vue Fondateur ↔ Vue Instructeur`
- La bascule change l'intégralité du dashboard affiché
- Transition fluide via Motion
- Le rôle actif est mémorisé dans le localStorage

**Attribution**
- Seul le Développeur peut attribuer ce double rôle
- Un Fondateur peut devenir Fondateur-Instructeur
- Un Instructeur peut devenir Fondateur-Instructeur
- La rétrogradation vers un rôle simple est aussi possible (Développeur uniquement)

---

## 6. Développeur (admin absolu)

### Périmètre
Accès total à tout. Aucune restriction.

### Dashboard développeur — contenu

**Synthèse globale**
- Résumé de tous les espaces : chiffres clés économiques + chiffres clés éducatifs sur une seule vue
- Activité en temps réel (dernières connexions, dernières leçons complétées)

**Gestion des rôles**
- Liste de tous les utilisateurs avec leur rôle actuel
- Bouton "Changer le rôle" sur chaque utilisateur
- Rôles disponibles : `user`, `instructor`, `founder`, `founder_instructor`, `developer`
- Confirmation obligatoire avant tout changement de rôle
- Historique des changements de rôle (qui a été promu/rétrogradé, quand)

**Accès aux contenus**
- Peut voir et accéder aux modules/leçons de tous les instructeurs
- Peut voir les dashboards de tous les rôles en mode lecture
- Bouton "Voir en tant que [rôle]" pour simuler l'espace d'un autre rôle

**Widget système**
- Statut Vercel : vert (déployé) / orange (en cours) / rouge (erreur) — lien vers Vercel dashboard
- Statut Supabase : vert (opérationnel) / rouge (incident) — lien vers Supabase dashboard
- Statut Sentry : nombre d'erreurs non résolues des 24 dernières heures — lien vers Sentry
- Actualisation automatique toutes les 5 minutes

**Messagerie**
- Peut contacter tous les rôles
- Voit toutes les conversations (y compris entre autres rôles si nécessaire pour modération)

---

## 7. Messagerie interne

### Fonctionnement
- Tout le monde peut contacter tout le monde
- Réponses possibles dans chaque conversation
- Messages groupés par conversation (fil de discussion)
- Badge de notification sur l'icône messagerie (nombre de messages non lus)
- **Les messages expirent automatiquement après 24h**

### Structure base de données — nouvelle table `messages`
```sql
create table messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade,
  recipient_id uuid references profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '24 hours')
);
```
Ajouter un job Supabase (pg_cron ou Edge Function) pour supprimer les messages expirés toutes les heures.

### UI messagerie
- Icône messagerie dans la navbar de chaque espace admin
- Panel latéral ou page dédiée `/admin/messages`
- Liste des conversations à gauche, fil de messages à droite (desktop) / vue empilée (mobile)
- Champ de saisie en bas avec bouton envoyer
- Indication "expire dans Xh" sur chaque message

---

## 8. Affichage des modules — cartes visuelles

Les cartes modules ont un visuel fort :
- Image en fond (pleine largeur) — si aucune image n'est fournie, utiliser un placeholder élégant avec dégradé
- Overlay gradient sombre en bas pour la lisibilité du texte
- Titre du module en blanc, gras, en bas de la carte
- Badge difficulté en haut à gauche
- Icône info en haut à droite
- Coins arrondis généreux
- Claude Code fait au mieux sans images de référence — le design doit rester professionnel

**Comportement selon le rôle :**
- Apprenant → clic ouvre la page de consultation du module
- Instructeur → clic ouvre la page d'édition du module
- Même composant `<ModuleCard />` avec une prop `mode="view" | "edit"`

---

## 9. Migrations SQL nécessaires

Claude Code doit créer dans l'ordre :

**Formulaire de création/édition de module (instructeur)**
Champs obligatoires :
- Titre du module
- Description / texte explicatif
- Niveau de difficulté — affiché sous forme de barres style signal réseau 📶 (comme sur les cartes de l'image Life Reset fournie) : 1 barre = Débutant, 2 barres = Intermédiaire, 3 barres = Avancé. À implémenter avec un composant SVG ou icône custom, pas du texte brut.
- Image de couverture (upload optionnel — placeholder si absent)
- Statut (Brouillon / Publié)
- Ordre d'affichage
- Assignation d'instructeurs supplémentaires (optionnel)

L'instructeur peut modifier tous ces champs à tout moment sur un module existant, y compris changer l'image, le titre, la difficulté et le statut.

---

## 10. Migrations SQL nécessaires

Claude Code doit créer dans l'ordre :

**Migration 005 — Mise à jour des rôles**
- Modifier la colonne `role` dans `profiles` pour accepter les nouvelles valeurs : `user`, `instructor`, `founder`, `founder_instructor`, `developer`
- Mettre à jour les policies RLS en conséquence
- Migrer les rôles existants (`admin` → `developer`)

**Migration 006 — Table messages**
- Créer la table `messages` avec expiration 24h
- Ajouter les policies RLS (un utilisateur voit uniquement ses conversations)
- Créer l'index sur `expires_at` pour la performance

---

## 10. Routing et middleware

Mettre à jour `middleware.ts` pour router selon le rôle :

| Rôle | Redirection après connexion |
|------|----------------------------|
| `user` | `/dashboard` |
| `instructor` | `/admin/instructor` |
| `founder` | `/admin/founder` |
| `founder_instructor` | `/admin/founder` (ou dernier espace mémorisé) |
| `developer` | `/admin/developer` |

---

## 11. Standards à respecter

- Lire `docs/ANTA_FRONTEND_BRIEF.md` pour toutes les exigences design
- UI UX Pro Max skill en priorité
- Motion pour les transitions et bascules de rôle
- GSAP pour les animations de dashboard (compteurs, graphiques)
- Plus Jakarta Sans + Inter
- Icônes Lucide ou Phosphor uniquement
- TypeScript strict
- Zéro layout générique

---

*Brief rédigé par ANASSE Guy Roland Obodjé — Juillet 2026*
