import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../models/module_item.dart';
import '../models/lesson_item.dart';

const _contentTypeLabels = {
  'qcm': 'QCM',
  'pdf': 'PDF',
  'video': 'Vidéo',
  'audio': 'Audio',
};

class ModuleDetailScreen extends StatefulWidget {
  final ModuleItem module;
  final bool isPremiumUser;

  const ModuleDetailScreen({
    super.key,
    required this.module,
    required this.isPremiumUser,
  });

  @override
  State<ModuleDetailScreen> createState() => _ModuleDetailScreenState();
}

class _ModuleDetailScreenState extends State<ModuleDetailScreen> {
  bool _isLoading = true;
  List<LessonItem> _lessons = [];
  Set<String> _completedLessonIds = {};
  String? _error;

  bool get _moduleLocked => widget.module.isPremium && !widget.isPremiumUser;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final supabase = Supabase.instance.client;
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      final lessonRows = await supabase
          .from('lessons')
          .select()
          .eq('module_id', widget.module.id)
          .eq('is_published', true)
          .order('order_index');
      final progressRows = await supabase
          .from('progress')
          .select('lesson_id, completed')
          .eq('user_id', userId);

      setState(() {
        _lessons = (lessonRows as List)
            .map((row) => LessonItem.fromMap(row as Map<String, dynamic>))
            .toList();
        _completedLessonIds = (progressRows as List)
            .where((row) => row['completed'] == true)
            .map((row) => row['lesson_id'] as String)
            .toSet();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger les leçons.';
        _isLoading = false;
      });
    }
  }

  void _onLessonTap(LessonItem lesson, bool locked) {
    if (locked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('🔒 Réservé aux membres Premium.')),
      );
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('🚧 Le moteur de leçon arrive bientôt sur mobile.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.module.title)),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!));

    if (_moduleLocked) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('🔒', style: TextStyle(fontSize: 48)),
              const SizedBox(height: 12),
              const Text(
                'Ce module est réservé aux membres Premium.',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      );
    }

    if (_lessons.isEmpty) {
      return const Center(child: Text("Aucune leçon publiée pour l'instant."));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: _lessons.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final lesson = _lessons[index];
        final locked = lesson.accessLevel == 'premium' && !widget.isPremiumUser;
        final completed = _completedLessonIds.contains(lesson.id);

        return Card(
          child: ListTile(
            onTap: () => _onLessonTap(lesson, locked),
            title: Text(
              '${index + 1}. ${lesson.title}',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            subtitle: Text(
              [
                _contentTypeLabels[lesson.contentType] ?? lesson.contentType,
                if (lesson.category != null) lesson.category!,
              ].join(' — '),
            ),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: completed
                    ? AntaColors.green.withValues(alpha: 0.15)
                    : locked
                    ? AntaColors.red.withValues(alpha: 0.1)
                    : AntaColors.slate200.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                completed
                    ? '✓ Terminée'
                    : locked
                    ? '🔒 Premium'
                    : 'À faire',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
