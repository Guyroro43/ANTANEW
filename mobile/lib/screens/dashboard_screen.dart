import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../models/profile.dart';
import 'app_shell.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  Profile? _profile;
  int _currentStreak = 0;
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
          .select()
          .eq('id', userId)
          .single();
      final streakRow = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', userId)
          .maybeSingle();

      setState(() {
        _profile = Profile.fromMap(profileRow);
        _currentStreak = (streakRow?['current_streak'] as int?) ?? 0;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger ton tableau de bord.';
        _isLoading = false;
      });
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

    final profile = _profile!;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Bonjour ${profile.firstName} 👋',
            style: Theme.of(
              context,
            ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            'Niveau ${profile.level} — ${profile.totalXp} XP — Streak de $_currentStreak jour${_currentStreak > 1 ? 's' : ''}.',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: 'XP total',
                  value: '${profile.totalXp}',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(label: 'Streak', value: '$_currentStreak 🔥'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _StatCard(label: 'Niveau', value: profile.level),
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

class _StatCard extends StatelessWidget {
  final String label;
  final String value;

  const _StatCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(color: AntaColors.slate500, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
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
