import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ANTA | African Native Tongue Academy',
  description: 'Apprends l’anglais avec des leçons courtes, culturelles et adaptées à la réalité africaine.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
