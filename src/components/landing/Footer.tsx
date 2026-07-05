import Link from 'next/link';

const linkClass = 'text-slate-600 transition hover:text-red-600 dark:text-slate-300 dark:hover:text-yellow-400';

export function Footer() {
  return (
    <footer className="border-t border-red-200/70 bg-white/70 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-black text-slate-900 dark:text-white">ANTA</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">African Native Tongue Academy</p>
            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              L&apos;anglais, ancré dans les réalités africaines. Un projet porté par la Junior Entreprise ESCA — INPHB.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Produit</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/#modules" className={linkClass}>
                  Modules
                </Link>
              </li>
              <li>
                <Link href="/inscription" className={linkClass}>
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/connexion" className={linkClass}>
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">À propos</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/a-propos" className={linkClass}>
                  À propos d&apos;ANTA
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Légal</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/cgu" className={linkClass}>
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className={linkClass}>
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          © {new Date().getFullYear()} ANTA — Junior Entreprise ESCA, INPHB.
        </div>
      </div>
    </footer>
  );
}
