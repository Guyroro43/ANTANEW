class QuestionItem {
  final String id;
  final String questionText;
  final List<String> options;
  final int correctIndex;
  final String? explanation;
  final int orderIndex;

  QuestionItem({
    required this.id,
    required this.questionText,
    required this.options,
    required this.correctIndex,
    required this.explanation,
    required this.orderIndex,
  });

  factory QuestionItem.fromMap(Map<String, dynamic> map) {
    final rawOptions = map['options'];
    return QuestionItem(
      id: map['id'] as String,
      questionText: map['question_text'] as String,
      options: rawOptions is List
          ? rawOptions.map((o) => o.toString()).toList()
          : <String>[],
      correctIndex: (map['correct_index'] as num?)?.toInt() ?? 0,
      explanation: map['explanation'] as String?,
      orderIndex: (map['order_index'] as num?)?.toInt() ?? 0,
    );
  }
}
