import Link from 'next/link';

const links = [
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
  { href: '/cgu', label: 'CGU' },
  { href: '/confidentialite', label: 'Confidentialité' },
];

export function Footer() {
  return (
    <footer className="border-t border-red-200/70 bg-white/70 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8 dark:text-slate-300">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">ANTA</p>
          <p className="mt-1">African Native Tongue Academy</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-amber-600">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
