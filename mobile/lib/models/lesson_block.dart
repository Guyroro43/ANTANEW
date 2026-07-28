class LessonBlock {
  final String id;
  final String blockType; // 'notion' | 'qcm'
  final int orderIndex;
  final Map<String, dynamic> content;

  LessonBlock({
    required this.id,
    required this.blockType,
    required this.orderIndex,
    required this.content,
  });

  factory LessonBlock.fromMap(Map<String, dynamic> map) {
    final rawContent = map['content'];
    return LessonBlock(
      id: map['id'] as String,
      blockType: (map['block_type'] as String?) ?? 'notion',
      orderIndex: (map['order_index'] as num?)?.toInt() ?? 0,
      content: rawContent is Map
          ? Map<String, dynamic>.from(rawContent)
          : <String, dynamic>{},
    );
  }

  // Bloc "notion"
  String get notionTitle => (content['title'] as String?) ?? '';
  String get notionBody => (content['body'] as String?) ?? '';
  String? get notionExample => content['example'] as String?;
  String? get notionAudioUrl => content['audio_url'] as String?;

  // Bloc "qcm"
  String get qcmQuestionText => (content['question_text'] as String?) ?? '';
  List<String> get qcmOptions {
    final raw = content['options'];
    return raw is List ? raw.map((o) => o.toString()).toList() : <String>[];
  }

  int get qcmCorrectIndex => (content['correct_index'] as num?)?.toInt() ?? 0;
  String? get qcmExplanation => content['explanation'] as String?;
}
