import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../models/profile.dart';
import 'abonnement_screen.dart';
import 'parametres_screen.dart';

const _levelLabels = {
  'debutant': 'Débutant',
  'intermediaire': 'Intermédiaire',
  'avance': 'Avancé',
};

class ProfilScreen extends StatefulWidget {
  const ProfilScreen({super.key});

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  bool _isLoading = true;
  Profile? _profile;
  int _currentStreak = 0;
  int _longestStreak = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final supabase = Supabase.instance.client;
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    final profileRow = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .single();
    final streakRow = await supabase
        .from('streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .maybeSingle();

    setState(() {
      _profile = Profile.fromMap(profileRow);
      _currentStreak = (streakRow?['current_streak'] as int?) ?? 0;
      _longestStreak = (streakRow?['longest_streak'] as int?) ?? 0;
      _isLoading = false;
    });
  }

  Future<void> _handleSignOut() async {
    await Supabase.instance.client.auth.signOut();
    // AuthGate (main.dart) redirige automatiquement vers l'écran de connexion.
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final profile = _profile!;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        CircleAvatar(
          radius: 36,
          backgroundColor: AntaColors.red,
          child: Text(
            profile.firstName.isNotEmpty
                ? profile.firstName[0].toUpperCase()
                : '?',
            style: const TextStyle(
              fontSize: 28,
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          profile.firstName,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
        ),
        Text(
          profile.isPremium ? 'Premium' : 'Starter',
          style: TextStyle(color: AntaColors.slate500),
        ),
        const SizedBox(height: 24),
        _InfoTile(
          label: 'Niveau actuel',
          value: profile.level,
          icon: Icons.shield_outlined,
        ),
        _InfoTile(
          label: "Niveau d'anglais",
          value: _levelLabels[profile.englishLevel] ?? profile.englishLevel,
          icon: Icons.menu_book_outlined,
        ),
        _InfoTile(
          label: 'XP total',
          value: '${profile.totalXp}',
          icon: Icons.bolt,
        ),
        _InfoTile(
          label: 'Streak',
          value:
              '$_currentStreak jour${_currentStreak > 1 ? 's' : ''} (record : $_longestStreak)',
          icon: Icons.local_fire_department,
        ),
        const SizedBox(height: 24),
        Card(
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.workspace_premium_outlined),
                title: const Text('Abonnement'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const AbonnementScreen()),
                ),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.settings_outlined),
                title: const Text('Paramètres'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ParametresScreen()),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: _handleSignOut,
          child: const Text('Déconnexion'),
        ),
      ],
    );
  }
}

class _InfoTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _InfoTile({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          radius: 18,
          backgroundColor: AntaColors.red.withValues(alpha: 0.1),
          child: Icon(icon, color: AntaColors.red, size: 18),
        ),
        title: Text(
          label,
          style: TextStyle(color: AntaColors.slate500, fontSize: 13),
        ),
        subtitle: Text(
          value,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
