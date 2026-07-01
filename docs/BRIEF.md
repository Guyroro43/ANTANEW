**ANTA**

*African Native Tongue Academy*

*Plateforme EdTech d\'apprentissage de l\'anglais pour la jeunesse
africaine*

> **BRIEF COMPLET DU PROJET**

Junior Entreprise ESCA --- INPHB --- Côte d\'Ivoire

Version 1.0 \| Juillet 2026 \| Document Confidentiel

**1. PRÉSENTATION GÉNÉRALE DU PROJET**

**1.1 Identité du projet**

+-----------------------------------+-----------------------------------+
| > **Champ**                       | > Détail                          |
+-----------------------------------+-----------------------------------+
| > **Nom du projet**               | > ANTA                            |
+-----------------------------------+-----------------------------------+
| > **Nom complet**                 | > African Native Tongue Academy   |
+-----------------------------------+-----------------------------------+
| > **Statut juridique**            | > Projet Junior Entreprise ESCA   |
|                                   | > --- INPHB                       |
+-----------------------------------+-----------------------------------+
| > **Porteur principal**           | > ANASSE Guy Roland Obodjé        |
+-----------------------------------+-----------------------------------+
| > **Rôle**                        | > Adjoint Chargé aux Traitements  |
|                                   | > et Analyse de Données --- JE    |
|                                   | > ESCA                            |
+-----------------------------------+-----------------------------------+
| > **Institution**                 | > INPHB --- Institut National     |
|                                   | > Polytechnique Houphouët-Boigny  |
+-----------------------------------+-----------------------------------+
| > **Localisation**                | > Côte d\'Ivoire (Abidjan /       |
|                                   | > Yamoussoukro)                   |
+-----------------------------------+-----------------------------------+
| > **Date de lancement visé**      | > Septembre 2026 (MVP)            |
+-----------------------------------+-----------------------------------+
| > **Modèle économique**           | > Freemium --- accès gratuit      |
|                                   | > permanent + abonnement Premium  |
+-----------------------------------+-----------------------------------+

**1.2 Vision et mission**

**Vision :**

Faire de l\'anglais un levier d\'ascension sociale et professionnelle
accessible à tout jeune africain, quelle que soit sa position
géographique ou économique.

**Mission :**

Proposer un apprentissage structuré, engageant et culturellement
pertinent de l\'anglais en 10 minutes par jour, via une application
mobile et web, au tarif le plus accessible possible pour les marchés
africains.

**1.3 Problème adressé**

Les plateformes d\'apprentissage de l\'anglais dominantes (Duolingo,
Babbel, Rosetta Stone) présentent plusieurs limitations structurelles
pour l\'utilisateur africain :

-   Exemples et situations culturellement éloignés (références à New
    York, Londres, Tokyo)

-   Tarification inadaptée aux revenus locaux --- abonnements en USD
    difficiles à payer

-   Absence des réalités professionnelles africaines (mobile money,
    marchés, entretiens locaux)

-   Indisponibilité des modes de paiement locaux (pas de mobile money)

-   Faible engagement sur la durée --- taux d\'abandon élevé après la
    première semaine

**1.4 Solution ANTA**

-   Ancrage culturel : leçons contextualisées dans la vie africaine
    réelle

-   Accessibilité tarifaire : 5 000 FCFA/mois en Premium, tier gratuit
    permanent

-   Gamification motivante : XP, streaks quotidiens, badges Adinkra,
    niveaux progressifs

-   Paiement local : intégration mobile money --- Orange Money, MTN,
    Wave, Moov

**1.5 Marchés cibles**

Phase 1 --- MVP (mois 1 à 6) : Côte d\'Ivoire

Phase 2 --- Extension (mois 7 à 18) : Sénégal, Cameroun, Bénin, Burkina
Faso, Togo

Phase 3 --- Consolidation : Ghana (marché anglophone complémentaire),
Mali, Niger

**1.6 Profil de l\'utilisateur cible**

+-----------------------------------+-----------------------------------+
| > **Critère**                     | > Détail                          |
+-----------------------------------+-----------------------------------+
| > **Tranche d\'âge**              | > 15 --- 35 ans                   |
+-----------------------------------+-----------------------------------+
| > **Profil principal**            | > Étudiant, jeune diplômé, jeune  |
|                                   | > professionnel                   |
+-----------------------------------+-----------------------------------+
| > **Niveau d\'anglais**           | > Débutant à intermédiaire        |
+-----------------------------------+-----------------------------------+
| > **Motivation**                  | > Emploi, voyage,                 |
|                                   | > entrepreneuriat, réseaux        |
|                                   | > sociaux internationaux          |
+-----------------------------------+-----------------------------------+
| > **Appareil dominant**           | > Smartphone Android --- mobile   |
|                                   | > first                           |
+-----------------------------------+-----------------------------------+
| > **Connexion**                   | > 3G/4G --- bande passante        |
|                                   | > limitée --- application légère  |
|                                   | > indispensable                   |
+-----------------------------------+-----------------------------------+
| > **Budget**                      | > Faible à moyen --- sensibilité  |
|                                   | > au prix élevée                  |
+-----------------------------------+-----------------------------------+

**2. ARCHITECTURE PRODUIT ET ARBORESCENCE**

**2.1 Vue d\'ensemble de la plateforme**

ANTA est accessible via deux canaux principaux :

-   Application web progressive (PWA) --- déployée sur Vercel,
    accessible depuis tout navigateur mobile

-   Application mobile native --- développée en React Native dans une
    phase ultérieure (post-MVP)

La plateforme est organisée en trois espaces : l\'espace public (landing
page, inscription), l\'espace apprenant (dashboard, leçons, progression)
et l\'espace administration (back-office).

**2.2 Arborescence complète des pages**

**A --- Espace public (utilisateur non connecté)**

**/ --- Page d\'accueil (Landing Page)**

-   Hero section : accroche principale, image tigre en fond, boutons CTA

-   Section statistiques : 10 min/jour --- 5 pays --- +300 XP --- 100%
    mobile first

-   Section « Comment ça marche » : 4 étapes illustrées avec icônes

-   Section modules : carrousel de leçons avec images animées et toggle
    Gratuit/Premium

-   Section tarifs : plan Starter gratuit et plan Premium 5 000
    FCFA/mois

-   Section avis : témoignages en carrousel avec navigation manuelle

-   CTA final : inscription rapide en 60 secondes

-   Footer : liens légaux, contact, logo

**/inscription --- Page d\'inscription**

-   Formulaire : prénom, adresse email, mot de passe

-   Connexion sociale : Google OAuth

-   Sélection du niveau initial : débutant / intermédiaire / avancé

-   Acceptation des CGU et de la politique de confidentialité

**/connexion --- Page de connexion**

-   Email + mot de passe

-   Lien « Mot de passe oublié »

-   Connexion Google OAuth

**/mot-de-passe-oublie --- Réinitialisation du mot de passe**

**/cgu --- Conditions générales d\'utilisation**

**/confidentialite --- Politique de confidentialité**

**/a-propos --- Page À propos du projet ANTA**

**/contact --- Formulaire de contact**

**B --- Espace apprenant (utilisateur connecté)**

**/dashboard --- Tableau de bord principal**

-   Bannière de bienvenue personnalisée : prénom + niveau actuel

-   Barre de progression globale en pourcentage

-   Streak du jour --- jours consécutifs connectés

-   XP total et niveau actuel (Lionceau, Chasseur, Guerrier, Lion,
    Léopard d\'Or)

-   Leçon recommandée du jour

-   Raccourcis rapides : Modules, Classement, Profil, Badges

**/modules --- Liste de tous les modules**

-   Toggle filtre : Tous / Gratuit / Premium

-   Grille de cartes par module avec image et animation image/texte

-   Statut de chaque module : verrouillé --- en cours --- complété

**/modules/\[slug\] --- Page d\'un module spécifique**

-   En-tête : titre, image, badge Gratuit ou Premium, XP disponible

-   Liste des leçons du module (5 minimum --- 10 maximum)

-   Progression individuelle affichée par leçon

-   Bouton « Commencer » ou « Reprendre »

**/lecon/\[id\] --- Page d\'une leçon (session d\'apprentissage)**

-   Introduction : objectif de la leçon --- 30 secondes

-   Phase 1 --- Vocabulaire : 5 mots clés avec définition et exemple
    audio (ElevenLabs)

-   Phase 2 --- QCM : 5 questions à choix multiple chronométrées

-   Feedback immédiat à chaque question : correct/incorrect +
    explication

-   Phase 3 --- Résultat : score sur 5 --- XP gagné --- badge obtenu si
    applicable

-   Bouton : « Leçon suivante » ou « Revoir »

**/classement --- Classement hebdomadaire**

-   Top 50 apprenants par XP hebdomadaire

-   Position de l\'utilisateur connecté mise en évidence

-   Filtre : classement national / classement global

**/badges --- Collection de badges Adinkra**

-   Grille de tous les badges disponibles

-   Badges obtenus (colorés) versus badges non obtenus (grisés)

-   Description et condition d\'obtention de chaque badge

**/profil --- Profil de l\'utilisateur**

-   Photo de profil, prénom, niveau, pays

-   Statistiques : XP total, leçons complétées, record de streak

-   Historique des 10 dernières leçons

-   Modification des informations personnelles

**/abonnement --- Gestion de l\'abonnement Premium**

-   État de l\'abonnement actuel : Starter ou Premium

-   Bouton de passage à Premium

-   Choix du mode de paiement : mobile money (Orange, MTN, Wave, Moov)
    ou carte

-   Historique des paiements et factures

**/parametres --- Paramètres du compte**

-   Langue de l\'interface : Français / Anglais

-   Thème : clair / sombre

-   Notifications push : activer/désactiver --- heure du rappel
    quotidien

-   Suppression du compte

**C --- Espace administration (back-office --- accès restreint)**

**/admin/dashboard --- Tableau de bord admin**

-   KPI : nombre d\'inscrits, actifs 7 jours, comptes Premium

-   Chiffre d\'affaires mensuel

-   Graphique d\'activité quotidienne

**/admin/modules --- Gestion des modules et leçons**

-   Créer / modifier / supprimer un module

-   Ajouter des leçons et des questions QCM

-   Publier / dépublier un module

**/admin/utilisateurs --- Gestion des utilisateurs**

-   Liste, recherche et filtre par statut

-   Profil détaillé d\'un utilisateur

-   Suspension ou suppression d\'un compte

**/admin/abonnements --- Gestion des paiements**

-   Historique de toutes les transactions

-   Statut des abonnements actifs et expirés

**3. MODULES DE CONTENU PÉDAGOGIQUE**

**3.1 Structure d\'un module**

-   1 titre clair ancré dans une situation réelle

-   1 image représentative de la situation (fournie par le porteur de
    projet)

-   5 leçons minimum --- 10 leçons maximum par module

-   Chaque leçon : 5 mots de vocabulaire + 5 questions QCM + 1 note
    culturelle

-   Récompense : XP à l\'issue de chaque leçon, badge à l\'issue du
    module complet

**3.2 Modules MVP --- Phase 1**

+-----------------------------------+-----------------------------------+
| > **Module**                      | > Accès / XP                      |
+-----------------------------------+-----------------------------------+
| > **Salutations & Premiers        | > Gratuit --- +50 XP              |
| > contacts**                      |                                   |
+-----------------------------------+-----------------------------------+
| > **Anglais professionnel de      | > Gratuit --- +70 XP              |
| > base**                          |                                   |
+-----------------------------------+-----------------------------------+
| > **Voyage & Aéroports**          | > Premium --- +80 XP              |
+-----------------------------------+-----------------------------------+
| > **Entretien d\'embauche en      | > Premium --- +100 XP             |
| > anglais**                       |                                   |
+-----------------------------------+-----------------------------------+
| > **Tech & Startups africaines**  | > Premium --- +90 XP              |
+-----------------------------------+-----------------------------------+
| > **Vie quotidienne & Culture     | > Premium --- +60 XP              |
| > africaine**                     |                                   |
+-----------------------------------+-----------------------------------+
| > **Commerce & Négociation**      | > Premium --- +85 XP              |
+-----------------------------------+-----------------------------------+
| > **Anglais médical de base**     | > Premium --- +75 XP              |
+-----------------------------------+-----------------------------------+

**3.3 Système de niveaux**

+-----------------------------------+-----------------------------------+
| > **Niveau**                      | > XP requis                       |
+-----------------------------------+-----------------------------------+
| > **Lionceau**                    | > 0 --- 199 XP                    |
+-----------------------------------+-----------------------------------+
| > **Chasseur**                    | > 200 --- 499 XP                  |
+-----------------------------------+-----------------------------------+
| > **Guerrier**                    | > 500 --- 999 XP                  |
+-----------------------------------+-----------------------------------+
| > **Lion**                        | > 1 000 --- 1 999 XP              |
+-----------------------------------+-----------------------------------+
| > **Léopard d\'Or**               | > 2 000 XP et plus                |
+-----------------------------------+-----------------------------------+

**3.4 Badges Adinkra**

+-----------------------------------+-----------------------------------+
| > **Badge**                       | > Condition d\'obtention          |
+-----------------------------------+-----------------------------------+
| > **Éclair d\'Or**                | > Première leçon complétée        |
+-----------------------------------+-----------------------------------+
| > **Flamme Vivace**               | > 3 jours de streak consécutifs   |
+-----------------------------------+-----------------------------------+
| > **Étoile Noire**                | > 100 XP atteints                 |
+-----------------------------------+-----------------------------------+
| > **Champion**                    | > Score parfait sur 5 leçons      |
+-----------------------------------+-----------------------------------+
| > **Léopard d\'Or**               | > 300 XP atteints                 |
+-----------------------------------+-----------------------------------+
| > **Diamant**                     | > 10 jours de streak consécutifs  |
+-----------------------------------+-----------------------------------+
| > **Roi de la Savane**            | > 1 000 XP atteints               |
+-----------------------------------+-----------------------------------+
| > **Citoyen du Monde**            | > 1 500 XP atteints               |
+-----------------------------------+-----------------------------------+

**4. STACK TECHNIQUE**

**4.1 Frontend**

+-----------------------------------+-----------------------------------+
| > **Technologie**                 | > Rôle                            |
+-----------------------------------+-----------------------------------+
| > **Next.js 14 (App Router)**     | > Framework React --- rendu SSR + |
|                                   | > PWA                             |
+-----------------------------------+-----------------------------------+
| > **Tailwind CSS**                | > Stylisation utilitaire          |
+-----------------------------------+-----------------------------------+
| > **TypeScript**                  | > Typage statique --- sécurité du |
|                                   | > code                            |
+-----------------------------------+-----------------------------------+
| > **Framer Motion**               | > Animations UI fluides           |
+-----------------------------------+-----------------------------------+
| > **React Hook Form**             | > Gestion des formulaires         |
+-----------------------------------+-----------------------------------+
| > **Zustand**                     | > Gestion d\'état global léger    |
+-----------------------------------+-----------------------------------+

**4.2 Backend et base de données**

+-----------------------------------+-----------------------------------+
| > **Technologie**                 | > Rôle                            |
+-----------------------------------+-----------------------------------+
| > **Supabase**                    | > Backend as a Service --- Auth,  |
|                                   | > PostgreSQL, Storage, Realtime   |
+-----------------------------------+-----------------------------------+
| > **PostgreSQL**                  | > Base de données relationnelle   |
|                                   | > principale                      |
+-----------------------------------+-----------------------------------+
| > **Row Level Security**          | > Sécurité des données au niveau  |
|                                   | > de chaque ligne                 |
+-----------------------------------+-----------------------------------+
| > **Supabase Edge Functions**     | > Logique serveur --- calcul XP,  |
|                                   | > vérification abonnement         |
+-----------------------------------+-----------------------------------+
| > **SendGrid**                    | > Emails transactionnels ---      |
|                                   | > confirmation, relance, rappel   |
+-----------------------------------+-----------------------------------+

**4.3 Paiement**

+-----------------------------------+-----------------------------------+
| > **Technologie**                 | > Rôle                            |
+-----------------------------------+-----------------------------------+
| > **CinetPay**                    | > Mobile money Côte d\'Ivoire --- |
|                                   | > Orange Money, MTN, Wave, Moov   |
+-----------------------------------+-----------------------------------+
| > **Stripe**                      | > Paiement par carte bancaire     |
|                                   | > internationale                  |
+-----------------------------------+-----------------------------------+

**4.4 Intelligence artificielle et production de contenu**

+-----------------------------------+-----------------------------------+
| > **Outil**                       | > Usage                           |
+-----------------------------------+-----------------------------------+
| > **Claude (Anthropic)**          | > Génération de questions QCM,    |
|                                   | > corrections, notes culturelles  |
+-----------------------------------+-----------------------------------+
| > **ElevenLabs**                  | > Synthèse vocale pour l\'audio   |
|                                   | > des leçons --- voix native      |
|                                   | > anglophone                      |
+-----------------------------------+-----------------------------------+
| > **HeyGen / Synthesia**          | > Vidéos pédagogiques avec avatar |
|                                   | > IA                              |
+-----------------------------------+-----------------------------------+
| > **Runway ML / CapCut**          | > Montage et habillage des vidéos |
+-----------------------------------+-----------------------------------+
| > **Canva Pro**                   | > Visuels, thumbnails,            |
|                                   | > illustrations des modules       |
+-----------------------------------+-----------------------------------+

**4.5 Infrastructure et déploiement**

+-----------------------------------+-----------------------------------+
| > **Technologie**                 | > Rôle                            |
+-----------------------------------+-----------------------------------+
| > **Vercel**                      | > Hébergement et déploiement      |
|                                   | > continu (CI/CD)                 |
+-----------------------------------+-----------------------------------+
| > **GitHub**                      | > Contrôle de version --- dépôt   |
|                                   | > du code source                  |
+-----------------------------------+-----------------------------------+
| > **GitHub Copilot**              | > Assistance au développement     |
+-----------------------------------+-----------------------------------+
| > **Sentry**                      | > Monitoring des erreurs en       |
|                                   | > production                      |
+-----------------------------------+-----------------------------------+
| > **Cloudflare**                  | > CDN, DNS, protection DDoS       |
+-----------------------------------+-----------------------------------+

**4.6 Schéma de la base de données --- 8 tables principales**

-   profiles --- id, username, full_name, avatar_url, level, total_xp,
    created_at

-   lessons --- id, title, description, category, difficulty,
    order_index, is_published

-   questions --- id, lesson_id, question_text, options (JSONB),
    correct_index, order_index

-   progress --- id, user_id, lesson_id, completed, score, completed_at

-   streaks --- id, user_id, current_streak, longest_streak,
    last_activity_date

-   xp_logs --- id, user_id, xp_earned, reason, created_at

-   badges --- id, name, description, icon, xp_required

-   user_badges --- id, user_id, badge_id, earned_at

**5. MODÈLE ÉCONOMIQUE**

**5.1 Structure tarifaire**

+-----------------------------------+-----------------------------------+
| > **Plan**                        | > Prix et contenu                 |
+-----------------------------------+-----------------------------------+
| > **Starter (Gratuit)**           | > Accès permanent --- 2 modules   |
|                                   | > débloqués --- XP et streaks --- |
|                                   | > badges de base                  |
+-----------------------------------+-----------------------------------+
| > **Premium**                     | > 5 000 FCFA/mois --- tous        |
|                                   | > modules --- audio natif ---     |
|                                   | > corrections --- sans publicité  |
+-----------------------------------+-----------------------------------+

**5.2 Projections de revenus --- Scénario conservateur**

+-----------------------------------+-----------------------------------+
| > **Période**                     | > Inscrits / Premium / Revenu     |
|                                   | > mensuel estimé                  |
+-----------------------------------+-----------------------------------+
| > **Mois 1 --- 3**                | > 500 inscrits --- 50 Premium --- |
|                                   | > 250 000 FCFA/mois               |
+-----------------------------------+-----------------------------------+
| > **Mois 4 --- 6**                | > 2 000 inscrits --- 200 Premium  |
|                                   | > --- 1 000 000 FCFA/mois         |
+-----------------------------------+-----------------------------------+
| > **Mois 7 --- 12**               | > 8 000 inscrits --- 800 Premium  |
|                                   | > --- 4 000 000 FCFA/mois         |
+-----------------------------------+-----------------------------------+
| > **Année 2**                     | > 30 000 inscrits --- 3 000       |
|                                   | > Premium --- 15 000 000          |
|                                   | > FCFA/mois                       |
+-----------------------------------+-----------------------------------+

**5.3 Sources de revenus complémentaires (phase 2)**

-   Partenariats entreprises : accès ANTA pour les employés (licences
    B2B)

-   Certifications payantes : attestation ANTA Level reconnue par des
    partenaires

-   Publicités contextuelles non intrusives sur le plan Starter

-   Marketplace de cours de formateurs externes africains --- commission
    20%

**6. STRATÉGIE MARKETING ET ACQUISITION**

**6.1 Canaux d\'acquisition prioritaires**

+-----------------------------------+-----------------------------------+
| > **Canal**                       | > Stratégie                       |
+-----------------------------------+-----------------------------------+
| > **TikTok**                      | > Contenu court en français local |
|                                   | > : « 3 phrases d\'anglais pour   |
|                                   | > ton entretien » --- cible 15-28 |
|                                   | > ans                             |
+-----------------------------------+-----------------------------------+
| > **Instagram Reels**             | > Visuels pédagogiques,           |
|                                   | > avant/après vocabulaire,        |
|                                   | > témoignages d\'apprenants       |
+-----------------------------------+-----------------------------------+
| > **Facebook**                    | > Groupes étudiants, publicités   |
|                                   | > géociblées Côte d\'Ivoire et    |
|                                   | > diaspora africaine              |
+-----------------------------------+-----------------------------------+
| > **WhatsApp**                    | > Bot de leçon quotidienne        |
|                                   | > gratuite --- partage viral      |
|                                   | > naturel                         |
+-----------------------------------+-----------------------------------+
| > **YouTube**                     | > Leçons gratuites complètes pour |
|                                   | > référencement organique (SEO)   |
+-----------------------------------+-----------------------------------+
| > **Bouche-à-oreille**            | > Programme de parrainage : 1     |
|                                   | > mois Premium offert par ami     |
|                                   | > inscrit                         |
+-----------------------------------+-----------------------------------+

**6.2 Positionnement**

ANTA se positionne non pas comme une application éducative de plus, mais
comme le premier outil d\'anglais fait par des Africains pour des
Africains. La mascotte (le tigre), les badges Adinkra, les exemples
culturels et la tarification en FCFA construisent une identité de marque
forte et différenciante face aux acteurs internationaux.

**6.3 Plan de lancement --- Mois 1**

-   Semaine 1 : déploiement MVP --- tests internes --- landing page ANTA
    en ligne

-   Semaine 2 : lancement bêta fermé --- 50 testeurs recrutés à INPHB et
    dans le réseau JE ESCA

-   Semaine 3 : collecte des retours --- corrections --- publication des
    premiers avis

-   Semaine 4 : lancement officiel sur les réseaux sociaux --- début des
    publicités payantes

**7. ROADMAP DE DÉVELOPPEMENT**

**7.1 Phase 0 --- Fondation (Juillet 2026)**

-   Finalisation du brief et du budget

-   Mise en place du dépôt GitHub et de l\'environnement de
    développement

-   Création du projet Supabase --- base de données, authentification,
    tables

-   Déploiement de la landing page ANTA sur Vercel

-   Production du premier contenu pédagogique (modules 1 et 2)

**7.2 Phase 1 --- MVP (Août --- Septembre 2026)**

-   Développement du dashboard apprenant

-   Système de leçons, QCM et validation des réponses

-   Système XP, streaks et niveaux

-   Collection de 8 badges Adinkra

-   Classement hebdomadaire

-   Intégration paiement CinetPay --- mobile money

-   Tests utilisateurs sur groupe bêta INPHB

**7.3 Phase 2 --- Lancement public (Octobre --- Décembre 2026)**

-   Lancement public en Côte d\'Ivoire

-   Intégration audio ElevenLabs sur tous les modules

-   Ajout de 4 modules supplémentaires

-   Campagnes publicité Meta et TikTok

-   Lancement du programme de parrainage

**7.4 Phase 3 --- Expansion régionale (2027)**

-   Extension au Sénégal, Cameroun, Bénin

-   Développement application mobile React Native

-   Module de certification payante

-   Partenariats entreprises --- offres B2B

-   Marketplace de formateurs africains

**8. ÉQUIPE ET GOUVERNANCE**

**8.1 Équipe projet actuelle**

+-----------------------------------+-----------------------------------+
| > **Rôle**                        | > Compétences requises            |
+-----------------------------------+-----------------------------------+
| > **Porteur de projet / Dev       | > Next.js, Supabase, PostgreSQL,  |
| > Full-Stack**                    | > déploiement Vercel              |
+-----------------------------------+-----------------------------------+
| > **Responsable contenu           | > Anglais niveau B2+, conception  |
| > pédagogique**                   | > de curricula                    |
+-----------------------------------+-----------------------------------+
| > **Designer UI/UX**              | > Figma, identité visuelle mobile |
+-----------------------------------+-----------------------------------+
| > **Responsable marketing         | > Meta Ads, TikTok, community     |
| > digital**                       | > management                      |
+-----------------------------------+-----------------------------------+
| > **Responsable financier JE      | > Suivi budget, facturation       |
| > ESCA**                          | > clients, reporting mensuel      |
+-----------------------------------+-----------------------------------+

**8.2 Gouvernance Junior Entreprise ESCA**

Le projet ANTA est développé dans le cadre de la Junior Entreprise ESCA
(INPHB). À ce titre :

-   Il est soumis à la validation du bureau exécutif de la JE ESCA

-   Les recettes générées suivent les règles de répartition interne de
    la JE

-   Un rapport d\'avancement mensuel est produit pour la direction

-   Le projet peut constituer un livrable académique valorisable pour
    les membres participants

**9. ANALYSE DES RISQUES**

+-----------------------------------+-----------------------------------+
| > **Risque**                      | > Niveau / Mitigation             |
+-----------------------------------+-----------------------------------+
| > **Faible adoption initiale**    | > Moyen --- Programme bêta,       |
|                                   | > marketing ciblé,                |
|                                   | > bouche-à-oreille                |
+-----------------------------------+-----------------------------------+
| > **Concurrence Duolingo,         | > Moyen --- Différenciation       |
| > Babbel**                        | > culturelle forte, tarif local   |
|                                   | > imbattable                      |
+-----------------------------------+-----------------------------------+
| > **Difficultés paiement mobile   | > Moyen --- CinetPay              |
| > money**                         | > multi-opérateurs, paiement      |
|                                   | > manuel en fallback              |
+-----------------------------------+-----------------------------------+
| > **Qualité pédagogique           | > Élevé --- Révision par          |
| > insuffisante**                  | > enseignants anglophones, tests  |
|                                   | > utilisateurs                    |
+-----------------------------------+-----------------------------------+
| > **Capacité technique limitée**  | > Moyen --- Priorisation MVP      |
|                                   | > strict, outils no-code pour     |
|                                   | > l\'admin                        |
+-----------------------------------+-----------------------------------+
| > **Coupures internet             | > Faible --- Mode hors-ligne      |
| > fréquentes**                    | > partiel, contenu allégé via PWA |
+-----------------------------------+-----------------------------------+
| > **Abandon après inscription**   | > Élevé --- Notifications push,   |
|                                   | > streaks, emails de relance      |
|                                   | > automatisés                     |
+-----------------------------------+-----------------------------------+

**10. CONFORMITÉ LÉGALE ET PROTECTION DES DONNÉES**

**10.1 Cadre juridique applicable**

-   Droit OHADA --- Acte uniforme sur le droit commercial général

-   Loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection
    des données personnelles

-   Règlement intérieur de la Junior Entreprise ESCA --- INPHB

**10.2 Données personnelles collectées**

-   Prénom, adresse email, pays --- collectés à l\'inscription

-   Données de progression --- XP, leçons complétées, streaks ---
    générées par l\'usage

-   Données de paiement --- traitées exclusivement par CinetPay / Stripe
    --- ANTA ne stocke aucune donnée bancaire

**10.3 Mesures de sécurité**

-   Row Level Security (RLS) activée sur toutes les tables Supabase

-   Authentification JWT gérée par Supabase Auth

-   HTTPS obligatoire sur tous les endpoints --- Vercel + Cloudflare

-   Aucun mot de passe stocké en clair --- hachage bcrypt via Supabase

-   Journalisation des accès admin et audit trail

**CONCLUSION**

ANTA est un projet à fort potentiel d\'impact social et de viabilité
économique. Il s\'inscrit dans une dynamique continentale de
valorisation des compétences numériques et linguistiques de la jeunesse
africaine. Porté par la Junior Entreprise ESCA dans le cadre académique
de l\'INPHB, il bénéficie d\'un ancrage institutionnel solide et d\'une
équipe technique capable de mener le MVP à terme.

Le MVP prévu pour septembre 2026 permettra de valider les hypothèses
clés du modèle --- adoption, rétention, taux de conversion Starter vers
Premium --- avant d\'engager les ressources nécessaires à l\'expansion
régionale.

Ce document constitue la référence centrale du projet ANTA. Toute
décision de développement, de contenu, de marketing ou d\'architecture
doit être alignée avec les orientations ici définies et mise à jour dans
les révisions successives de ce brief.

**Document préparé par : ANASSE Guy Roland Obodjé**

Adjoint Chargé aux Traitements et Analyse de Données --- Junior
Entreprise ESCA --- INPHB

Juillet 2026
