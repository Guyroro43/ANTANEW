import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getMessaging, getToken, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

/**
 * Demande la permission navigateur, enregistre le service worker de
 * réception en arrière-plan, et renvoie le token FCM de cet appareil (ou
 * null si non supporté / refusé / configuration manquante).
 */
export async function requestWebPushToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (!firebaseConfig.apiKey) return null; // Firebase pas encore configuré (env vars absentes)
  if (!(await isSupported())) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const messaging: Messaging = getMessaging(getFirebaseApp());

  return getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}
