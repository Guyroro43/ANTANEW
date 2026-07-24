class VocabularyItem {
  final String id;
  final String word;
  final String definition;
  final String? example;
  final String? audioUrl;
  final int orderIndex;

  VocabularyItem({
    required this.id,
    required this.word,
    required this.definition,
    required this.example,
    required this.audioUrl,
    required this.orderIndex,
  });

  factory VocabularyItem.fromMap(Map<String, dynamic> map) {
    return VocabularyItem(
      id: map['id'] as String,
      word: map['word'] as String,
      definition: map['definition'] as String,
      example: map['example'] as String?,
      audioUrl: map['audio_url'] as String?,
      orderIndex: (map['order_index'] as num?)?.toInt() ?? 0,
    );
  }
}
