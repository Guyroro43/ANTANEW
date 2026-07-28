import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../models/module_item.dart';
import '../models/lesson_item.dart';
import 'lecon_screen.dart';
import 'lecon_blocks_screen.dart';

const _contentTypeLabels = {
  'qcm': 'QCM',
  'pdf': 'PDF',
  'video': 'Vidéo',
  'audio': 'Audio',
};

const _contentTypeIcons = {
  'qcm': Icons.quiz_outlined,
  'pdf': Icons.description_outlined,
  'video': Icons.play_circle_outline,
  'audio': Icons.graphic_eq,
};

enum _LessonTab { todo, done }

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
  _LessonTab _tab = _LessonTab.todo;
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

  Future<void> _onLessonTap(LessonItem lesson, bool locked) async {
    if (locked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.lock_outline, size: 16, color: Colors.white),
              SizedBox(width: 8),
              Text('Réservé aux membres Premium.'),
            ],
          ),
        ),
      );
      return;
    }
    final alreadyCompleted = _completedLessonIds.contains(lesson.id);
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => lesson.format == 'blocks'
            ? LeconBlocksScreen(lesson: lesson, alreadyCompleted: alreadyCompleted)
            : LeconScreen(lesson: lesson, alreadyCompleted: alreadyCompleted),
      ),
    );
    _load();
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
              Icon(Icons.lock_outline, size: 48, color: AntaColors.slate500),
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

    final todoLessons = _lessons.where((l) => !_completedLessonIds.contains(l.id)).toList();
    final doneLessons = _lessons.where((l) => _completedLessonIds.contains(l.id)).toList();
    final filtered = _tab == _LessonTab.todo ? todoLessons : doneLessons;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Row(
          children: [
            _TabPill(
              label: 'À faire (${todoLessons.length})',
              selected: _tab == _LessonTab.todo,
              onTap: () => setState(() => _tab = _LessonTab.todo),
            ),
            const SizedBox(width: 8),
            _TabPill(
              label: 'Terminées (${doneLessons.length})',
              selected: _tab == _LessonTab.done,
              onTap: () => setState(() => _tab = _LessonTab.done),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (filtered.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Text(
              _tab == _LessonTab.todo ? 'Tout est fait ici, bravo !' : 'Aucune leçon terminée pour l\'instant.',
              style: TextStyle(color: AntaColors.slate500),
            ),
          )
        else
          ...filtered.map((lesson) {
            final locked = lesson.accessLevel == 'premium' && !widget.isPremiumUser;
            final completed = _completedLessonIds.contains(lesson.id);
            return Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: _LessonCard(
                lesson: lesson,
                locked: locked,
                completed: completed,
                onTap: () => _onLessonTap(lesson, locked),
              ),
            );
          }),
      ],
    );
  }
}

class _TabPill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _TabPill({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? Theme.of(context).colorScheme.primary : AntaColors.slate200.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 13,
            color: selected ? Colors.white : AntaColors.slate500,
          ),
        ),
      ),
    );
  }
}

class _LessonCard extends StatelessWidget {
  final LessonItem lesson;
  final bool locked;
  final bool completed;
  final VoidCallback onTap;

  const _LessonCard({
    required this.lesson,
    required this.locked,
    required this.completed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: AntaColors.red.withValues(alpha: 0.1),
                  child: Icon(
                    _contentTypeIcons[lesson.contentType] ?? Icons.quiz_outlined,
                    color: AntaColors.red,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AntaColors.slate200.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          _contentTypeLabels[lesson.contentType] ?? lesson.contentType,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AntaColors.slate500,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        lesson.title,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        lesson.description ?? lesson.category ?? 'Une leçon pratique pour progresser en anglais.',
                        style: TextStyle(color: AntaColors.slate500, fontSize: 13, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: onTap,
                style: ElevatedButton.styleFrom(
                  backgroundColor: locked ? AntaColors.yellow : null,
                  foregroundColor: locked ? AntaColors.slate900 : null,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
                child: Text(locked ? 'Débloquer Premium' : (completed ? 'Revoir' : 'Commencer')),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
