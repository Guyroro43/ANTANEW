'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { requestWebPushToken } from '@/lib/firebase-client';
import { Toggle } from '@/components/ui/Toggle';

interface NotificationsToggleProps {
  userId: string;
  initialEnabled: boolean;
}

export function NotificationsToggle({ userId, initialEnabled }: NotificationsToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  const handleChange = async (next: boolean) => {
    const previous = enabled;
    setEnabled(next);
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ notifications_enabled: next }).eq('id', userId);

    if (error) {
      setEnabled(previous);
      setSaving(false);
      return;
    }

    if (next) {
      requestWebPushToken()
        .then(async (token) => {
          if (!token) return;
          await supabase.from('device_tokens').upsert({ user_id: userId, token, platform: 'web' }, { onConflict: 'token' });
        })
        .catch(() => {});
    } else {
      await supabase.from('device_tokens').delete().eq('user_id', userId);
    }

    setSaving(false);
  };

  return (
    <Toggle
      checked={enabled}
      onChange={handleChange}
      disabled={saving}
      label={enabled ? 'Activées' : 'Désactivées'}
    />
  );
}
