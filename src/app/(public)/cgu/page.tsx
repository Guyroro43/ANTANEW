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
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">CGU</p>
        <h1 className="mt-3 text-4xl font-black">Conditions générales d&apos;utilisation</h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Dernière mise à jour : juillet 2026</p>

        <Section title="1. Objet">
          <p>
            Les présentes conditions générales d&apos;utilisation (« CGU ») régissent l&apos;accès et l&apos;utilisation de la
            plateforme ANTA (African Native Tongue Academy), accessible via son site web et son application mobile
            (ensemble, le « Service »), éditée pour proposer un apprentissage de l&apos;anglais adapté aux réalités
            africaines. En créant un compte ou en utilisant le Service, vous acceptez sans réserve les présentes CGU.
          </p>
        </Section>

        <Section title="2. Description du service">
          <p>
            ANTA propose des modules et leçons d&apos;anglais (texte, vidéo, audio), un test de niveau automatique, un
            suivi de progression (XP, streaks, badges, classement), ainsi que des fonctionnalités assistées par
            intelligence artificielle : génération de contenu pédagogique, retours personnalisés sur la progression,
            et un partenaire de conversation virtuel (« Kora » et les personnages associés) pour s&apos;entraîner à
            l&apos;oral et à l&apos;écrit.
          </p>
          <p>
            L&apos;accès de base (« Starter ») est gratuit. Un abonnement payant (« Premium ») donnant accès à des
            contenus additionnels pourra être proposé ; ses conditions spécifiques (tarifs, moyens de paiement, durée)
            seront communiquées séparément au moment de son activation.
          </p>
        </Section>

        <Section title="3. Inscription et compte utilisateur">
          <p>
            L&apos;inscription nécessite un prénom, une adresse email valide (ou un compte Google) et un mot de passe.
            Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis
            votre compte. Toute inscription frauduleuse ou usurpation d&apos;identité peut entraîner la suspension du
            compte concerné.
          </p>
          <p>
            Le Service s&apos;adresse à un large public de jeunes apprenants. Si vous avez moins de 15 ans, l&apos;inscription
            doit être effectuée avec l&apos;accord d&apos;un parent ou tuteur légal, qui reste responsable de l&apos;usage qui en
            est fait.
          </p>
        </Section>

        <Section title="4. Test de niveau et évaluations">
          <p>
            Le niveau d&apos;anglais est déterminé automatiquement par un test chronométré à l&apos;inscription. Ce test
            (comme les évaluations intégrées aux leçons) doit être réalisé de façon autonome, sans recours à une aide
            extérieure ou à un outil d&apos;intelligence artificielle tiers : le résultat sert à adapter le contenu à
            votre niveau réel, et non à obtenir une note.
          </p>
        </Section>

        <Section title="5. Utilisation de l'intelligence artificielle">
          <p>
            Certaines fonctionnalités (génération de contenu, résumé de progression, partenaire de conversation)
            s&apos;appuient sur des services d&apos;intelligence artificielle tiers (notamment Google Gemini). Les messages
            échangés avec le partenaire de conversation et certaines données de progression peuvent être transmis à
            ces services pour générer une réponse. Ces échanges sont un outil d&apos;entraînement libre et ne
            constituent jamais une évaluation notée. Voir notre{' '}
            <Link href="/confidentialite" className="font-semibold text-red-600 hover:underline dark:text-green-400">
              politique de confidentialité
            </Link>{' '}
            pour le détail du traitement de ces données.
          </p>
        </Section>

        <Section title="6. Comportement de l'utilisateur">
          <p>Vous vous engagez à ne pas :</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>utiliser le Service à des fins frauduleuses, illégales ou contraires à sa destination pédagogique ;</li>
            <li>tenter de contourner les mesures de sécurité, d&apos;accès premium ou d&apos;évaluation ;</li>
            <li>publier ou transmettre, via le partenaire de conversation ou tout autre canal, des contenus injurieux, haineux ou illicites ;</li>
            <li>extraire, revendre ou redistribuer les contenus pédagogiques d&apos;ANTA sans autorisation.</li>
          </ul>
        </Section>

        <Section title="7. Propriété intellectuelle">
          <p>
            Les contenus pédagogiques, la marque ANTA, les visuels et personnages (dont Kora, Amara, Kwame et Sango)
            ainsi que le code de la plateforme sont la propriété d&apos;ANTA ou de ses partenaires, et protégés par le
            droit de la propriété intellectuelle. Aucune reproduction ou exploitation commerciale n&apos;est autorisée
            sans accord écrit préalable.
          </p>
        </Section>

        <Section title="8. Abonnement Premium et paiement">
          <p>
            Lorsqu&apos;il sera activé, l&apos;abonnement Premium sera payant, renouvelable selon la périodicité choisie, et
            réglable via les moyens de paiement proposés (mobile money, carte bancaire). Les conditions de
            remboursement, de résiliation et de non-reconduction seront précisées dans les conditions spécifiques de
            l&apos;offre au moment de son lancement.
          </p>
        </Section>

        <Section title="9. Responsabilité">
          <p>
            ANTA met tout en œuvre pour assurer la disponibilité et la qualité pédagogique du Service, sans garantir
            l&apos;absence totale d&apos;interruption, d&apos;erreur ou de résultat d&apos;apprentissage spécifique. ANTA ne saurait
            être tenue responsable des dommages indirects résultant de l&apos;utilisation du Service, ni du contenu
            généré par les fonctionnalités d&apos;intelligence artificielle, qui peut occasionnellement contenir des
            approximations.
          </p>
        </Section>

        <Section title="10. Suspension et résiliation">
          <p>
            ANTA se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU,
            notamment en cas de fraude, d&apos;abus ou d&apos;usage détourné du Service. Vous pouvez supprimer votre compte à
            tout moment depuis les paramètres de votre profil ou en nous contactant.
          </p>
        </Section>

        <Section title="11. Modification des CGU">
          <p>
            ANTA peut modifier les présentes CGU à tout moment pour refléter l&apos;évolution du Service ou de la
            réglementation applicable. Les utilisateurs seront informés des modifications substantielles ; la
            poursuite de l&apos;utilisation du Service après modification vaut acceptation des nouvelles CGU.
          </p>
        </Section>

        <Section title="12. Droit applicable">
          <p>
            Les présentes CGU sont soumises au droit ivoirien. Tout litige relatif à leur interprétation ou
            exécution relève, à défaut de résolution amiable, de la compétence des juridictions de Côte d&apos;Ivoire.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Pour toute question relative aux présentes CGU, vous pouvez nous contacter via la page{' '}
            <Link href="/contact" className="font-semibold text-red-600 hover:underline dark:text-green-400">
              Contact
            </Link>{' '}
            du site.
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
