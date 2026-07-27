'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { requestWebPushToken } from '@/lib/firebase-client';

interface PushNotificationRegistrationProps {
  userId: string;
  notificationsEnabled: boolean;
}

/**
 * Monté une fois dans le layout apprenant : si les notifications sont
 * activées (réglage Paramètres) et que la permission navigateur n'a pas
 * encore été demandée, enregistre le token FCM de cet appareil.
 */
export function PushNotificationRegistration({ userId, notificationsEnabled }: PushNotificationRegistrationProps) {
  useEffect(() => {
    if (!notificationsEnabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;

    requestWebPushToken()
      .then(async (token) => {
        if (!token) return;
        const supabase = createClient();
        await supabase.from('device_tokens').upsert({ user_id: userId, token, platform: 'web' }, { onConflict: 'token' });
      })
      .catch(() => {
        // Silencieux : le refus de permission ou l'absence de support ne doit pas bloquer l'app.
      });
  }, [userId, notificationsEnabled]);

  return null;
}
