class Profile {
  final String id;
  final String firstName;
  final String? avatarUrl;
  final String englishLevel;
  final String level;
  final int totalXp;
  final String subscriptionPlan;
  final String? subscriptionExpiresAt;
  final String createdAt;

  Profile({
    required this.id,
    required this.firstName,
    required this.avatarUrl,
    required this.englishLevel,
    required this.level,
    required this.totalXp,
    required this.subscriptionPlan,
    required this.subscriptionExpiresAt,
    required this.createdAt,
  });

  factory Profile.fromMap(Map<String, dynamic> map) {
    return Profile(
      id: map['id'] as String,
      firstName: (map['first_name'] as String?) ?? 'Apprenant',
      avatarUrl: map['avatar_url'] as String?,
      englishLevel: (map['english_level'] as String?) ?? 'debutant',
      level: (map['level'] as String?) ?? 'Lionceau',
      totalXp: (map['total_xp'] as num?)?.toInt() ?? 0,
      subscriptionPlan: (map['subscription_plan'] as String?) ?? 'starter',
      subscriptionExpiresAt: map['subscription_expires_at'] as String?,
      createdAt: (map['created_at'] as String?) ?? '',
    );
  }

  bool get isPremium => subscriptionPlan == 'premium';
}
