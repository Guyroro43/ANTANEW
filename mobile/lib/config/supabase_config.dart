/// Mêmes valeurs publiques que NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
/// côté web (.env.local) — la clé anonyme est faite pour être embarquée côté client,
/// la sécurité est assurée par les policies RLS de Supabase.
class SupabaseConfig {
  static const String url = 'https://qtwnntflqvehekxlaotc.supabase.co';
  static const String anonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0d25udGZscXZlaGVreGxhb3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTU5NDMsImV4cCI6MjEwMDI5MTk0M30.ey0bnbTuuXh1CmSFwcgKM2BGYfeI-9mf9dxrtAD4b_o';
}
