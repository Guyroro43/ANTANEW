import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-2 space-y-3 text-base leading-7 text-slate-700 dark:text-slate-300">{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Confidentialité</p>
        <h1 className="mt-3 text-4xl font-black">Politique de confidentialité</h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Dernière mise à jour : juillet 2026</p>

        <Section title="1. Responsable du traitement">
          <p>
            ANTA (African Native Tongue Academy) est responsable du traitement des données personnelles collectées
            via son site web et son application mobile (le « Service »). Pour toute question relative à vos données,
            contactez-nous via la page{' '}
            <Link href="/contact" className="font-semibold text-red-600 hover:underline dark:text-green-400">
              Contact
            </Link>
            .
          </p>
        </Section>

        <Section title="2. Données collectées">
          <ul className="list-disc space-y-1 pl-6">
            <li>Données de compte : prénom, adresse email, mot de passe (chiffré) ou identifiant de connexion Google ;</li>
            <li>Données de progression : niveau d&apos;anglais, XP, streak, badges, réponses aux exercices et au test de niveau ;</li>
            <li>Données d&apos;usage : leçons consultées, historique de complétion, préférences (thème, personnage vocal choisi) ;</li>
            <li>
              Échanges avec le partenaire de conversation IA : les messages textuels que vous envoyez et les réponses
              générées ;
            </li>
            <li>
              Données vocales : lorsque vous utilisez le mode vocal, la reconnaissance de la parole et la synthèse
              vocale sont effectuées directement par votre navigateur ou système d&apos;exploitation — l&apos;audio brut
              n&apos;est ni transmis ni conservé par ANTA, seul le texte reconnu est traité comme un message classique ;
            </li>
            <li>Données de paiement (le cas échéant, une fois l&apos;abonnement Premium activé) : traitées par notre prestataire de paiement, jamais stockées directement par ANTA.</li>
          </ul>
        </Section>

        <Section title="3. Finalités du traitement">
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>créer et sécuriser votre compte, et vous authentifier ;</li>
            <li>adapter le contenu pédagogique à votre niveau réel (test de niveau, recommandations de leçons) ;</li>
            <li>suivre votre progression, calculer votre classement et débloquer vos badges ;</li>
            <li>générer les réponses du partenaire de conversation et les résumés de progression personnalisés ;</li>
            <li>améliorer la qualité du Service et assurer sa sécurité.</li>
          </ul>
        </Section>

        <Section title="4. Partage avec des tiers">
          <p>Certaines données sont partagées avec des prestataires techniques, uniquement dans la mesure nécessaire au fonctionnement du Service :</p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Supabase</strong> : hébergement de la base de données et authentification ;</li>
            <li><strong>Google (Gemini)</strong> : génération de contenu pédagogique, résumés de progression, et réponses du partenaire de conversation — les messages échangés avec le partenaire de conversation lui sont transmis pour générer une réponse ;</li>
            <li><strong>Vercel</strong> : hébergement du site web ;</li>
            <li><strong>Google Sign-In</strong> : authentification, si vous choisissez de vous connecter avec votre compte Google.</li>
          </ul>
          <p>Ces prestataires n&apos;utilisent vos données que pour exécuter les services demandés par ANTA et ne sont pas autorisés à les exploiter à d&apos;autres fins. Aucune donnée n&apos;est vendue à des tiers.</p>
        </Section>

        <Section title="5. Durée de conservation">
          <p>
            Vos données sont conservées tant que votre compte est actif. En cas de suppression de votre compte,
            vos données personnelles sont supprimées dans un délai raisonnable, sauf obligation légale de
            conservation plus longue (notamment pour les données de facturation).
          </p>
        </Section>

        <Section title="6. Sécurité">
          <p>
            L&apos;accès à vos données est protégé par des règles de sécurité au niveau de la base de données (Row Level
            Security) garantissant que chaque utilisateur ne peut accéder qu&apos;à ses propres données, ainsi que par un
            chiffrement des communications (HTTPS) entre votre appareil et nos serveurs.
          </p>
        </Section>

        <Section title="7. Vos droits">
          <p>
            Conformément à la loi ivoirienne n° 2013-450 relative à la protection des données à caractère personnel
            et sous le contrôle de l&apos;ARTCI, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et
            d&apos;opposition concernant vos données personnelles. Vous pouvez exercer ces droits directement depuis les
            paramètres de votre compte (modification du profil, suppression de compte) ou en nous contactant via la
            page{' '}
            <Link href="/contact" className="font-semibold text-red-600 hover:underline dark:text-green-400">
              Contact
            </Link>
            .
          </p>
        </Section>

        <Section title="8. Mineurs">
          <p>
            ANTA s&apos;adresse à un large public de jeunes apprenants. Si vous avez moins de 15 ans, l&apos;inscription et
            l&apos;utilisation du Service doivent se faire avec l&apos;accord d&apos;un parent ou tuteur légal, qui peut à tout
            moment demander la suppression du compte de l&apos;enfant mineur en nous contactant.
          </p>
        </Section>

        <Section title="9. Cookies">
          <p>
            ANTA utilise uniquement des cookies strictement nécessaires au fonctionnement du Service (maintien de
            votre session de connexion). Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
          </p>
        </Section>

        <Section title="10. Modification de cette politique">
          <p>
            Cette politique de confidentialité peut être mise à jour pour refléter l&apos;évolution du Service ou de la
            réglementation. La date de dernière mise à jour figure en haut de cette page ; en cas de changement
            substantiel, les utilisateurs en seront informés.
          </p>
        </Section>

        <Link
          href="/"
          className="mt-10 inline-flex rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
