import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../models/leaderboard_entry.dart';

const _medalColors = {
  1: Color(0xFFFACC15),
  2: Color(0xFFCBD5E1),
  3: Color(0xFFD97706),
};

class ClassementScreen extends StatefulWidget {
  const ClassementScreen({super.key});

  @override
  State<ClassementScreen> createState() => _ClassementScreenState();
}

class _ClassementScreenState extends State<ClassementScreen> {
  bool _isLoading = true;
  List<LeaderboardEntry> _entries = [];
  int? _myRank;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final supabase = Supabase.instance.client;
    try {
      final leaderboardRows = await supabase.rpc(
        'get_leaderboard',
        params: {'p_limit': 20},
      );
      final myRankResult = await supabase.rpc('get_my_rank');

      setState(() {
        _entries = (leaderboardRows as List)
            .map((row) => LeaderboardEntry.fromMap(row as Map<String, dynamic>))
            .toList();
        _myRank = myRankResult == null ? null : (myRankResult as num).toInt();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger le classement.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!));
    if (_entries.isEmpty) {
      return const Center(
        child: Text("Le classement n'est pas encore disponible."),
      );
    }

    final userId = Supabase.instance.client.auth.currentUser?.id;
    final isInTop = _entries.any((entry) => entry.id == userId);

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ..._entries.map((entry) {
            final isMe = entry.id == userId;
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              color: isMe ? AntaColors.yellow.withValues(alpha: 0.15) : null,
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: _medalColors[entry.rank] ?? AntaColors.red,
                  child: _medalColors.containsKey(entry.rank)
                      ? const Icon(
                          Icons.emoji_events,
                          color: Colors.white,
                          size: 18,
                        )
                      : Text(
                          '${entry.rank}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
                title: Text(
                  entry.firstName + (isMe ? ' (toi)' : ''),
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                subtitle: Text(entry.level),
                trailing: Text(
                  '${entry.totalXp} XP',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            );
          }),
          if (!isInTop && _myRank != null) ...[
            const SizedBox(height: 8),
            const Divider(),
            const SizedBox(height: 8),
            Text(
              'Ta position actuelle : #$_myRank',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ],
      ),
    );
  }
}
