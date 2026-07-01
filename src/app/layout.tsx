export const metadata = {
  title: "ANTA",
  description: "African Native Tongue Academy"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}