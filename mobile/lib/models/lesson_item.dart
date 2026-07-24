class LessonItem {
  final String id;
  final String title;
  final String? description;
  final String? category;
  final String contentType;
  final String? contentUrl;
  final String accessLevel;
  final int orderIndex;

  LessonItem({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.contentType,
    required this.contentUrl,
    required this.accessLevel,
    required this.orderIndex,
  });

  factory LessonItem.fromMap(Map<String, dynamic> map) {
    return LessonItem(
      id: map['id'] as String,
      title: map['title'] as String,
      description: map['description'] as String?,
      category: map['category'] as String?,
      contentType: (map['content_type'] as String?) ?? 'qcm',
      contentUrl: map['content_url'] as String?,
      accessLevel: (map['access_level'] as String?) ?? 'free',
      orderIndex: (map['order_index'] as num?)?.toInt() ?? 0,
    );
  }
}
