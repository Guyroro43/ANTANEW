class LeaderboardEntry {
  final int rank;
  final String id;
  final String firstName;
  final String? avatarUrl;
  final String level;
  final int totalXp;

  LeaderboardEntry({
    required this.rank,
    required this.id,
    required this.firstName,
    required this.avatarUrl,
    required this.level,
    required this.totalXp,
  });

  factory LeaderboardEntry.fromMap(Map<String, dynamic> map) {
    return LeaderboardEntry(
      rank: (map['rank'] as num).toInt(),
      id: map['id'] as String,
      firstName: (map['first_name'] as String?) ?? 'Apprenant',
      avatarUrl: map['avatar_url'] as String?,
      level: (map['level'] as String?) ?? 'Lionceau',
      totalXp: (map['total_xp'] as num?)?.toInt() ?? 0,
    );
  }
}
