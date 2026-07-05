class ModuleItem {
  final String id;
  final String slug;
  final String title;
  final String? description;
  final bool isPremium;
  final int xpReward;
  final int orderIndex;

  ModuleItem({
    required this.id,
    required this.slug,
    required this.title,
    required this.description,
    required this.isPremium,
    required this.xpReward,
    required this.orderIndex,
  });

  factory ModuleItem.fromMap(Map<String, dynamic> map) {
    return ModuleItem(
      id: map['id'] as String,
      slug: map['slug'] as String,
      title: map['title'] as String,
      description: map['description'] as String?,
      isPremium: (map['is_premium'] as bool?) ?? false,
      xpReward: (map['xp_reward'] as num?)?.toInt() ?? 0,
      orderIndex: (map['order_index'] as num?)?.toInt() ?? 0,
    );
  }
}
