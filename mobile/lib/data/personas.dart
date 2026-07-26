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

const personas = [
  Persona(id: 'kora', name: 'Kora', gender: 'female', avatarAsset: 'assets/avatars/kora.png'),
  Persona(id: 'amara', name: 'Amara', gender: 'female', avatarAsset: 'assets/avatars/amara.png'),
  Persona(id: 'kwame', name: 'Kwame', gender: 'male', avatarAsset: 'assets/avatars/kwame.png'),
  Persona(id: 'sango', name: 'Sango', gender: 'male', avatarAsset: 'assets/avatars/sango.png'),
];

Persona getPersona(String id) {
  return personas.firstWhere((p) => p.id == id, orElse: () => personas.first);
}
