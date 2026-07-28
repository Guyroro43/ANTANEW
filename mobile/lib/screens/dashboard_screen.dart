import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../config/api_config.dart';
import '../config/app_theme.dart';
import '../models/profile.dart';
import '../models/lesson_item.dart';
import '../widgets/welcome_back_sheet.dart';
import 'app_shell.dart';
import 'lecon_screen.dart';

const _weekdayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const _minCompletedLessonsForInsights = 3;
const _weakCategoryThresholdPercent = 70;

class _DayInfo {
  final String label;
  final int dayNumber;
  final bool isToday;
  final bool done;

  _DayInfo({required this.label, required this.dayNumber, required this.isToday, required this.done});
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  Profile? _profile;
  int _currentStreak = 0;
  bool _streakIntact = false;
  bool _hasCompletedToday = false;
  List<_DayInfo> _weekDays = [];
  LessonItem? _nextLesson;
  bool _isAdaptiveRecommendation = false;
  String? _progressSummary;
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
      final profileRow = await supabase.from('profiles').select().eq('id', userId).single();
      final streakRow = await supabase
          .from('streaks')
          .select('current_streak, last_activity_date')
          .eq('user_id', userId)
          .maybeSingle();
      final isPremiumUser = profileRow['subscription_plan'] == 'premium';

      final moduleRows = await supabase
          .from('modules')
          .select('id, order_index, is_premium')
          .eq('is_published', true)
          .order('order_index');
      final moduleIds = (moduleRows as List).map((m) => m['id'] as String).toList();
      final modulesById = {for (final m in moduleRows) m['id'] as String: m};

      final lessonRows = moduleIds.isEmpty
          ? <dynamic>[]
          : await supabase
              .from('lessons')
              .select()
              .eq('is_published', true)
              .inFilter('module_id', moduleIds)
              .order('order_index');
      final progressRows = await supabase
          .from('progress')
          .select('lesson_id, completed, completed_at, score, max_score')
          .eq('user_id', userId);

      final completedLessonIds = (progressRows as List)
          .where((row) => row['completed'] == true)
          .map((row) => row['lesson_id'] as String)
          .toSet();
      final completedDateKeys = (progressRows)
          .where((row) => row['completed'] == true && row['completed_at'] != null)
          .map((row) => (row['completed_at'] as String).substring(0, 10))
          .toSet();

      final now = DateTime.now();
      final todayKey = DateFormat('yyyy-MM-dd').format(now);
      final hasCompletedToday = completedDateKeys.contains(todayKey);

      final startOfWeek = now.subtract(Duration(days: now.weekday % 7));
      final weekDays = List.generate(7, (i) {
        final date = startOfWeek.add(Duration(days: i));
        final key = DateFormat('yyyy-MM-dd').format(date);
        return _DayInfo(
          label: _weekdayLabels[i],
          dayNumber: date.day,
          isToday: key == todayKey,
          done: completedDateKeys.contains(key),
        );
      });

      final lessonsById = {for (final row in lessonRows) row['id'] as String: row as Map<String, dynamic>};
      final availableLessonRows = <Map<String, dynamic>>[];
      for (final row in lessonRows) {
        final id = row['id'] as String;
        if (completedLessonIds.contains(id)) continue;
        final parentModule = modulesById[row['module_id'] as String];
        final moduleLocked = (parentModule?['is_premium'] as bool?) == true && !isPremiumUser;
        final lessonLocked = row['access_level'] == 'premium' && !isPremiumUser;
        if (moduleLocked || lessonLocked) continue;
        availableLessonRows.add(row as Map<String, dynamic>);
      }

      final defaultNextLesson = availableLessonRows.isEmpty ? null : availableLessonRows.first;
      Map<String, dynamic>? nextLessonRow = defaultNextLesson;
      var isAdaptive = false;

      final completedRows = progressRows.where((row) => row['completed'] == true).toList();
      if (completedRows.length >= _minCompletedLessonsForInsights) {
        final statsByCategory = <String, List<double>>{};
        for (final row in completedRows) {
          final lesson = lessonsById[row['lesson_id'] as String];
          final category = (lesson?['category'] as String?) ?? 'Général';
          // Les lignes d'avant la migration 022 n'ont pas de max_score : leur
          // score était déjà normalisé sur 5 côté client, donc /5 reste correct.
          final max = (row['max_score'] as num?)?.toDouble() ?? 5;
          final score = (row['score'] as num?)?.toDouble() ?? 0;
          final percent = max > 0 ? (score / max) * 100 : 100.0;
          statsByCategory.putIfAbsent(category, () => []).add(percent);
        }
        String? weakestCategory;
        var lowestAvg = double.infinity;
        statsByCategory.forEach((category, percents) {
          final avg = percents.reduce((a, b) => a + b) / percents.length;
          if (avg < _weakCategoryThresholdPercent && avg < lowestAvg) {
            lowestAvg = avg;
            weakestCategory = category;
          }
        });

        if (weakestCategory != null) {
          final reinforcement = availableLessonRows.firstWhere(
            (row) => (row['category'] as String?) == weakestCategory,
            orElse: () => <String, dynamic>{},
          );
          if (reinforcement.isNotEmpty && reinforcement['id'] != defaultNextLesson?['id']) {
            nextLessonRow = reinforcement;
            isAdaptive = true;
          }
        }
      }

      final nextLesson = nextLessonRow == null ? null : LessonItem.fromMap(nextLessonRow);

      final lastActivityDate = streakRow?['last_activity_date'] as String?;
      final yesterdayKey = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 1)));
      final streakIntact = lastActivityDate != null && (lastActivityDate == todayKey || lastActivityDate == yesterdayKey);

      setState(() {
        _profile = Profile.fromMap(profileRow);
        _currentStreak = (streakRow?['current_streak'] as int?) ?? 0;
        _streakIntact = streakIntact;
        _hasCompletedToday = hasCompletedToday;
        _weekDays = weekDays;
        _nextLesson = nextLesson;
        _isAdaptiveRecommendation = isAdaptive;
        _isLoading = false;
      });

      if (!hasCompletedToday) {
        _maybeShowWelcomeBack();
      }
      _loadProgressSummary();
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger ton tableau de bord.';
        _isLoading = false;
      });
    }
  }

  Future<void> _loadProgressSummary() async {
    final token = Supabase.instance.client.auth.currentSession?.accessToken;
    if (token == null) return;

    try {
      final response = await http
          .get(
            Uri.parse('${ApiConfig.baseUrl}/api/mobile/progress-summary'),
            headers: {'Authorization': 'Bearer $token'},
          )
          .timeout(const Duration(seconds: 15));
      if (response.statusCode != 200) return;
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (mounted) setState(() => _progressSummary = data['summary'] as String?);
    } catch (_) {
      // Silencieux : le résumé est un bonus, pas critique pour l'usage du dashboard.
    }
  }

  Future<void> _maybeShowWelcomeBack() async {
    final prefs = await SharedPreferences.getInstance();
    final key = dismissKeyForToday();
    if (prefs.getBool(key) == true) return;
    if (!mounted) return;

    final profile = _profile;
    if (profile == null) return;

    await showWelcomeBackSheet(
      context,
      firstName: profile.firstName,
      currentStreak: _currentStreak,
      streakIntact: _streakIntact,
      onContinuer: () {
        if (_nextLesson != null) {
          _openLesson(_nextLesson!);
        } else {
          AppShell.of(context)?.goToTab(1);
        }
      },
      onStreak: () {},
      onBadges: () => AppShell.of(context)?.goToTab(3),
      onClassement: () => AppShell.of(context)?.goToTab(2),
      onDismiss: () async {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool(dismissKeyForToday(), true);
      },
      nextLesson: _nextLesson == null
          ? null
          : NextLessonInfo(title: _nextLesson!.title, onTap: () => _openLesson(_nextLesson!)),
    );
  }

  Future<void> _openLesson(LessonItem lesson) async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => LeconScreen(lesson: lesson, alreadyCompleted: false)),
    );
    _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(child: Text(_error!));
    }

    final profile = _profile!;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              border: Border.all(color: AntaColors.slate200),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: _weekDays
                        .map(
                          (day) => Column(
                            children: [
                              Text(
                                day.label,
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AntaColors.slate500),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                width: 30,
                                height: 30,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: day.isToday
                                      ? Theme.of(context).colorScheme.primary
                                      : day.done
                                          ? AntaColors.yellow.withValues(alpha: 0.3)
                                          : AntaColors.slate200.withValues(alpha: 0.5),
                                ),
                                child: day.done
                                    ? Icon(Icons.check, size: 14, color: day.isToday ? Colors.white : AntaColors.green)
                                    : Text(
                                        '${day.dayNumber}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: day.isToday ? Colors.white : AntaColors.slate500,
                                        ),
                                      ),
                              ),
                            ],
                          ),
                        )
                        .toList(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: AntaColors.slate200),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.local_fire_department, size: 16, color: AntaColors.red),
                      const SizedBox(width: 4),
                      Text('$_currentStreak', style: const TextStyle(fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AntaColors.red, AntaColors.yellow],
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bonjour ${profile.firstName} 👋',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                const SizedBox(height: 8),
                Text(
                  'Niveau ${profile.level} — ${profile.totalXp} XP — Streak de $_currentStreak jour${_currentStreak > 1 ? 's' : ''}.',
                  style: const TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 14),
                if (_isAdaptiveRecommendation) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.auto_awesome, size: 12, color: Colors.white),
                        SizedBox(width: 4),
                        Text('Recommandé pour toi', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
                ElevatedButton(
                  onPressed: () {
                    if (_nextLesson != null) {
                      _openLesson(_nextLesson!);
                    } else {
                      AppShell.of(context)?.goToTab(1);
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AntaColors.red),
                  child: const Text('Continuer une leçon'),
                ),
              ],
            ),
          ),
          if (_progressSummary != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.auto_awesome, color: Color(0xFFB45309), size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _progressSummary!,
                      style: const TextStyle(color: Color(0xFF78350F), fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
          Text('Objectifs du jour', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          _GoalCard(
            label: "Terminer une leçon aujourd'hui",
            done: _hasCompletedToday,
            background: const Color(0xFFFFF3E6),
          ),
          const SizedBox(height: 10),
          _GoalCard(
            label: 'Garder ton streak de $_currentStreak jour${_currentStreak > 1 ? 's' : ''}',
            done: _streakIntact,
            background: const Color(0xFFE6F3FF),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: 'XP total',
                  value: '${profile.totalXp}',
                  icon: Icons.bolt,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  label: 'Streak',
                  value: '$_currentStreak jour${_currentStreak > 1 ? 's' : ''}',
                  icon: Icons.local_fire_department,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _StatCard(
            label: 'Niveau',
            value: profile.level,
            icon: Icons.shield_outlined,
          ),
          const SizedBox(height: 24),
          Text('Raccourcis', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 2.2,
            children: [
              _ShortcutCard(
                label: 'Modules',
                icon: Icons.menu_book,
                onTap: () => AppShell.of(context)?.goToTab(1),
              ),
              _ShortcutCard(
                label: 'Classement',
                icon: Icons.leaderboard,
                onTap: () => AppShell.of(context)?.goToTab(2),
              ),
              _ShortcutCard(
                label: 'Badges',
                icon: Icons.emoji_events,
                onTap: () => AppShell.of(context)?.goToTab(3),
              ),
              _ShortcutCard(
                label: 'Profil',
                icon: Icons.person,
                onTap: () => AppShell.of(context)?.goToTab(4),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _GoalCard extends StatelessWidget {
  final String label;
  final bool done;
  final Color background;

  const _GoalCard({required this.label, required this.done, required this.background});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(18)),
      child: Row(
        children: [
          Container(
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: done ? AntaColors.green : Colors.transparent,
              border: Border.all(color: done ? AntaColors.green : AntaColors.slate500, width: 2),
            ),
            child: done ? const Icon(Icons.check, size: 16, color: Colors.white) : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                decoration: done ? TextDecoration.lineThrough : null,
                color: done ? AntaColors.slate500 : AntaColors.slate900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AntaColors.red.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AntaColors.red, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    label,
                    style: TextStyle(color: AntaColors.slate500, fontSize: 13),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ShortcutCard extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _ShortcutCard({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Icon(icon, color: AntaColors.red),
              const SizedBox(width: 10),
              Flexible(
                child: Text(
                  label,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
