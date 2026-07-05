/// Mêmes valeurs publiques que NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
/// côté web (.env.local) — la clé anonyme est faite pour être embarquée côté client,
/// la sécurité est assurée par les policies RLS de Supabase.
class SupabaseConfig {
  static const String url = 'https://cazerjonhhqkwdntsmqw.supabase.co';
  static const String anonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhemVyam9uaGhxa3dkbnRzbXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTkxNDcsImV4cCI6MjA5ODYzNTE0N30.Q8BlV34tE5kr8gZpIV7mpxmCTZwnsHQCOjbUdaLvSuU';
}
