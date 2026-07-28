class Persona {
  final String id;
  final String name;
  final String gender; // 'female' | 'male'
  final String avatarAsset;

  const Persona({
    required this.id,
    required this.name,
    required this.gender,
    required this.avatarAsset,
  });
}

// La voix de chaque personnage vient désormais du serveur (ElevenLabs, voir
// src/lib/personas.ts côté web) — plus besoin de distinguer les personnages
// par un pitch local, l'audio reçu est déjà une voix distincte par persona.
const personas = [
  Persona(id: 'kora', name: 'Kora', gender: 'female', avatarAsset: 'assets/avatars/kora.png'),
  Persona(id: 'amara', name: 'Amara', gender: 'female', avatarAsset: 'assets/avatars/amara.png'),
  Persona(id: 'kwame', name: 'Kwame', gender: 'male', avatarAsset: 'assets/avatars/kwame.png'),
  Persona(id: 'sango', name: 'Sango', gender: 'male', avatarAsset: 'assets/avatars/sango.png'),
];

Persona getPersona(String id) {
  return personas.firstWhere((p) => p.id == id, orElse: () => personas.first);
}
