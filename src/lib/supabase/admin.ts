import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Client Supabase avec la clé service_role — bypass RLS. Réservé aux routes
 * serveur qui ont déjà vérifié elles-mêmes les permissions de l'appelant
 * (ex: envoi de notifications push à tous les utilisateurs).
 */
export function createAdminClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
