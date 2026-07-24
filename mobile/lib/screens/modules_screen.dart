import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../models/module_item.dart';
import 'module_detail_screen.dart';

enum _ModuleFilter { tous, gratuit, premium }

class ModulesScreen extends StatefulWidget {
  const ModulesScreen({super.key});

  @override
  State<ModulesScreen> createState() => _ModulesScreenState();
}

class _ModulesScreenState extends State<ModulesScreen> {
  bool _isLoading = true;
  bool _isPremiumUser = false;
  List<ModuleItem> _modules = [];
  Map<String, int> _totalLessonsByModule = {};
  Map<String, int> _completedLessonsByModule = {};
  int _currentStreak = 0;
  int _badgesCount = 0;
  int _totalXp = 0;
  _ModuleFilter _filter = _ModuleFilter.tous;
  String? _error;

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
      final profileRow = await supabase
          .from('profiles')
          .select('subscription_plan, total_xp')
          .eq('id', userId)
          .single();
      final streakRow = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', userId)
          .maybeSingle();
      final badgeRows = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', userId);
      final badgesCount = (badgeRows as List).length;
      final moduleRows = await supabase
          .from('modules')
          .select()
          .eq('is_published', true)
          .order('order_index');

      final modules = (moduleRows as List)
          .map((row) => ModuleItem.fromMap(row as Map<String, dynamic>))
          .toList();
      final moduleIds = modules.map((m) => m.id).toList();

      final lessonRows = moduleIds.isEmpty
          ? <dynamic>[]
          : await supabase
              .from('lessons')
              .select('id, module_id')
              .eq('is_published', true)
              .inFilter('module_id', moduleIds);
      final progressRows = await supabase
          .from('progress')
          .select('lesson_id, completed')
          .eq('user_id', userId)
          .eq('completed', true);
      final completedLessonIds = (progressRows as List)
          .map((row) => row['lesson_id'] as String)
          .toSet();

      final totalByModule = <String, int>{};
      final completedByModule = <String, int>{};
      for (final row in lessonRows) {
        final moduleId = row['module_id'] as String;
        final lessonId = row['id'] as String;
        totalByModule[moduleId] = (totalByModule[moduleId] ?? 0) + 1;
        if (completedLessonIds.contains(lessonId)) {
          completedByModule[moduleId] = (completedByModule[moduleId] ?? 0) + 1;
        }
      }

      setState(() {
        _isPremiumUser = profileRow['subscription_plan'] == 'premium';
        _totalXp = (profileRow['total_xp'] as num?)?.toInt() ?? 0;
        _currentStreak = (streakRow?['current_streak'] as int?) ?? 0;
        _badgesCount = badgesCount;
        _modules = modules;
        _totalLessonsByModule = totalByModule;
        _completedLessonsByModule = completedByModule;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger les modules.';
        _isLoading = false;
      });
    }
  }

  List<ModuleItem> get _filteredModules {
    switch (_filter) {
      case _ModuleFilter.gratuit:
        return _modules.where((m) => !m.isPremium).toList();
      case _ModuleFilter.premium:
        return _modules.where((m) => m.isPremium).toList();
      case _ModuleFilter.tous:
        return _modules;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(child: Text(_error!));
    }
    if (_modules.isEmpty) {
      return const Center(
        child: Text('Aucun module disponible pour le moment.'),
      );
    }

    final filtered = _filteredModules;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Row(
            children: [
              Expanded(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _StatPill(
                      icon: Icons.local_fire_department,
                      value: '$_currentStreak',
                      color: AntaColors.red,
                    ),
                    _StatPill(
                      icon: Icons.emoji_events,
                      value: '$_badgesCount',
                      color: AntaColors.yellow,
                    ),
                    _StatPill(
                      icon: Icons.bolt,
                      value: '$_totalXp',
                      color: AntaColors.green,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Choisis un parcours',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _FilterPill(
                  label: 'Tous',
                  selected: _filter == _ModuleFilter.tous,
                  onTap: () => setState(() => _filter = _ModuleFilter.tous),
                ),
                const SizedBox(width: 8),
                _FilterPill(
                  label: 'Gratuit',
                  selected: _filter == _ModuleFilter.gratuit,
                  onTap: () => setState(() => _filter = _ModuleFilter.gratuit),
                ),
                const SizedBox(width: 8),
                _FilterPill(
                  label: 'Premium',
                  selected: _filter == _ModuleFilter.premium,
                  onTap: () => setState(() => _filter = _ModuleFilter.premium),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          if (filtered.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Text('Aucun module dans cette catégorie.'),
            )
          else
            ...filtered.asMap().entries.map((entry) {
              final index = entry.key;
              final module = entry.value;
              final locked = module.isPremium && !_isPremiumUser;
              final total = _totalLessonsByModule[module.id] ?? 0;
              final completed = _completedLessonsByModule[module.id] ?? 0;

              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _ModuleCard(
                  module: module,
                  locked: locked,
                  completed: completed,
                  total: total,
                  gradient: _fallbackGradients[index % _fallbackGradients.length],
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ModuleDetailScreen(
                          module: module,
                          isPremiumUser: _isPremiumUser,
                        ),
                      ),
                    );
                  },
                ),
              );
            }),
        ],
      ),
    );
  }
}

const _fallbackGradients = [
  [AntaColors.red, AntaColors.yellow],
  [AntaColors.yellow, AntaColors.green],
  [AntaColors.green, AntaColors.yellow],
  [AntaColors.red, AntaColors.green],
];

class _StatPill extends StatelessWidget {
  final IconData icon;
  final String value;
  final Color color;

  const _StatPill({required this.icon, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        border: Border.all(color: AntaColors.slate200),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

class _FilterPill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterPill({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? Theme.of(context).colorScheme.primary : AntaColors.slate200.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: selected ? Colors.white : AntaColors.slate500,
          ),
        ),
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final ModuleItem module;
  final bool locked;
  final int completed;
  final int total;
  final List<Color> gradient;
  final VoidCallback onTap;

  const _ModuleCard({
    required this.module,
    required this.locked,
    required this.completed,
    required this.total,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: SizedBox(
          height: 200,
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (module.imageUrl != null)
                Image.network(
                  module.imageUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => _GradientBackground(colors: gradient),
                )
              else
                _GradientBackground(colors: gradient),
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.05),
                      Colors.black.withValues(alpha: 0.75),
                    ],
                  ),
                ),
              ),
              if (locked)
                Container(
                  color: Colors.black.withValues(alpha: 0.55),
                  alignment: Alignment.center,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.lock_outline, size: 16, color: AntaColors.slate900),
                        SizedBox(width: 6),
                        Text('Réservé Premium', style: TextStyle(fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ),
                ),
              Positioned(
                left: 18,
                top: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: module.isPremium
                        ? AntaColors.yellow.withValues(alpha: 0.95)
                        : AntaColors.green.withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    module.isPremium ? 'Premium' : 'Gratuit',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 18,
                right: 18,
                bottom: 16,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      module.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.bolt, size: 14, color: AntaColors.yellow),
                            const SizedBox(width: 4),
                            Text(
                              '$completed/$total leçons terminées',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.9),
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                        if (!locked)
                          const Icon(Icons.chevron_right, color: Colors.white, size: 20),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GradientBackground extends StatelessWidget {
  final List<Color> colors;

  const _GradientBackground({required this.colors});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: colors,
        ),
      ),
    );
  }
}
