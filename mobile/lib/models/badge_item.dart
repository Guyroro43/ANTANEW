class BadgeItem {
  final String id;
  final String slug;
  final String name;
  final String description;
  final String icon;
  final int? xpRequired;
  DateTime? earnedAt;

  BadgeItem({
    required this.id,
    required this.slug,
    required this.name,
    required this.description,
    required this.icon,
    required this.xpRequired,
    this.earnedAt,
  });

  factory BadgeItem.fromMap(Map<String, dynamic> map) {
    return BadgeItem(
      id: map['id'] as String,
      slug: map['slug'] as String,
      name: map['name'] as String,
      description: map['description'] as String,
      icon: (map['icon'] as String?) ?? '🏅',
      xpRequired: (map['xp_required'] as num?)?.toInt(),
    );
  }

  bool get isUnlocked => earnedAt != null;
}
