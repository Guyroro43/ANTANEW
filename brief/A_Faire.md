# ANTA — Ce qu'il reste à faire

_Dernière mise à jour : 20/07/2026_

## 🔴 Priorité 1 — Paiement (le plus gros manque)

Le modèle est freemium à 5 000 FCFA/mois (Premium), payé en Mobile Money via CinetPay (Orange/MTN/Wave/Moov), avec Stripe en option carte bancaire. Aujourd'hui c'est juste un bouton désactivé "bientôt disponible" + des routes webhook vides.

**Ce qu'il faut d'abord (toi) :**
- [ ] Créer un compte marchand CinetPay + KYC (documents JE ESCA), récupérer `apikey` + `site_id` (commencer en mode sandbox).
- [ ] (Optionnel) Créer un compte Stripe + récupérer clé secrète + `whsec_...` si on garde l'option carte.

**Ce que je coderai une fois les clés fournies :**
- [ ] Route `/api/abonnement/checkout` — crée un lien de paiement CinetPay et redirige.
- [ ] Vrai webhook `/api/webhook/cinetpay` — vérifie via l'API "Check Payment Status" de CinetPay (obligatoire, la notification seule n'est pas signée).
- [ ] Écriture dans `transactions` + mise à jour `profiles.subscription_plan`/`subscription_expires_at` (+30 jours) à la confirmation.
- [ ] Remplacer le bouton "bientôt disponible" par le vrai flux, web **et** mobile.
- [ ] Renouvellement : rappel avant expiration + repaiement manuel (décision prise — pas de prélèvement auto Mobile Money).
- [ ] Si Stripe : même schéma mais vérification par signature (`Stripe-Signature`).

## 🟠 Priorité 2 — Migrations Supabase pas encore exécutées

Trois migrations SQL ont été écrites mais il faut confirmer qu'elles ont bien été passées dans Supabase (SQL Editor) :
- [ ] `009_fix_profiles_privilege_escalation.sql` — corrige une faille où un utilisateur pouvait se donner le rôle admin ou passer Premium gratuitement.
- [ ] `010_fix_complete_lesson_access_level.sql` — empêche de valider une leçon premium sans y avoir droit.
- [ ] `011_pdf_to_interactive_course.sql` — passe le bucket médias en privé (URLs signées) + crée le bucket `lesson-source` pour les PDF admin.

Tant que ces migrations ne sont pas passées, les failles restent ouvertes en prod et les médias vidéo/audio restent sur des URLs publiques permanentes.

## 🟡 Priorité 3 — À tester en conditions réelles

- [ ] Flux complet PDF → génération IA de cours interactif (upload PDF admin → bouton "Générer depuis le PDF" → relecture/approbation des questions) — codé mais jamais testé de bout en bout avec un vrai PDF.
- [ ] Facturation Anthropic Console : confirmer qu'il y a des crédits (sinon la génération IA échoue silencieusement en prod).
- [ ] Nouveau design (web + mobile) à valider visuellement sur plusieurs écrans/tailles réelles, pas juste vérifié par compilation.

## 🟢 Priorité 4 — Dette technique / à faire à un moment

- [ ] **Aucun test automatisé** (ni web ni mobile) — à envisager au moins sur le moteur de leçon et les RPC critiques (`complete_lesson`, génération de questions).
- [ ] **70 fichiers modifiés non commités** depuis le dernier commit (`f4f9097`) — tout le travail de cette session (sécurité, moteur PDF→IA, refonte design web/mobile, icône app) doit être commité puis pushé.
- [ ] Espace admin (utilisateurs, abonnements, paramètres) a reçu une passe design plus légère que le reste — pas d'anti-pattern grave, mais moins peaufiné que dashboard/modules/leçon.
- [ ] Vérifier les deux vidéos ajoutées dans `brief/` (`Web ispeakspokespoken.mp4`, `app duolingo.mp4`) — références concurrentes probablement destinées à inspirer une future itération UX, pas encore exploitées.

## ✅ Fait récemment (pour mémoire)

- Sécurité : 2 failles corrigées, médias passés en privé + URLs signées.
- Moteur de leçon complet (QCM/vidéo/audio/PDF→IA) web + mobile.
- App mobile : moteur de leçon ajouté, icône changée (symbole Nkyinkyim), design retravaillé (typographie Poppins/Open Sans, icônes cohérentes au lieu d'emoji).
- Web : typographie, tokens de couleur, refonte design dashboard/modules/classement/badges/profil/paramètres/abonnement/admin.
- Déploiement Vercel fonctionnel, variables d'environnement configurées.
