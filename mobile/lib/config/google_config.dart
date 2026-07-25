/// Client ID "Web application" créé dans Google Cloud Console pour ANTA
/// (le même que celui déjà configuré côté provider Google de Supabase).
/// Ce n'est PAS un secret — il est fait pour être embarqué côté client,
/// contrairement au Client Secret qui ne doit jamais quitter Supabase.
class GoogleConfig {
  static const String webClientId = 'REMPLACE_MOI.apps.googleusercontent.com';
}
