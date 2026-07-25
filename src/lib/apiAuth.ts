import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient, createClientWithToken } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

/**
 * Résout le client Supabase + l'utilisateur authentifié pour une route API,
 * que l'appelant soit le site web (cookies) ou l'app mobile Flutter
 * (en-tête Authorization: Bearer <access_token>).
 */
export async function getAuthenticatedClient(
  request: Request,
): Promise<{ supabase: SupabaseClient<Database>; user: User | null }> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return createClientWithToken(authHeader.slice('Bearer '.length));
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
