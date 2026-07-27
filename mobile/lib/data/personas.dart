class Persona {
  final String id;
  final String name;
  final String gender; // 'female' | 'male'
  final String avatarAsset;
  final double pitch;

  const Persona({
    required this.id,
    required this.name,
    required this.gender,
    required this.avatarAsset,
    required this.pitch,
  });
}

// Une seule voix système par langue est fréquente sur Android : le pitch
// garantit que les 4 personnages restent distinguables même sans voix
// distinctes installées sur l'appareil. Mêmes valeurs que côté web pour la
// cohérence entre plateformes.
const personas = [
  Persona(id: 'kora', name: 'Kora', gender: 'female', avatarAsset: 'assets/avatars/kora.png', pitch: 1.15),
  Persona(id: 'amara', name: 'Amara', gender: 'female', avatarAsset: 'assets/avatars/amara.png', pitch: 1.3),
  Persona(id: 'kwame', name: 'Kwame', gender: 'male', avatarAsset: 'assets/avatars/kwame.png', pitch: 0.82),
  Persona(id: 'sango', name: 'Sango', gender: 'male', avatarAsset: 'assets/avatars/sango.png', pitch: 0.65),
];

Persona getPersona(String id) {
  return personas.firstWhere((p) => p.id == id, orElse: () => personas.first);
}
