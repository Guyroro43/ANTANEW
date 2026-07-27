import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let app: App | null = null;

/**
 * Credentials Firebase (compte de service) — jamais exposées côté client.
 * FIREBASE_PRIVATE_KEY contient des "\n" littéraux une fois collée dans les
 * variables d'environnement Vercel, d'où le remplacement ci-dessous.
 */
function getAdminApp() {
  if (!app) {
    const existing = getApps();
    app =
      existing[0] ??
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
  }
  return app;
}

export function getAdminMessaging() {
  return getMessaging(getAdminApp());
}
