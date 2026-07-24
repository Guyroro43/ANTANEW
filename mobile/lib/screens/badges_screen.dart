import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../models/badge_item.dart';

class BadgesScreen extends StatefulWidget {
  const BadgesScreen({super.key});

  @override
  State<BadgesScreen> createState() => _BadgesScreenState();
}

class _BadgesScreenState extends State<BadgesScreen> {
  bool _isLoading = true;
  List<BadgeItem> _badges = [];
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
      final badgeRows = await supabase
          .from('badges')
          .select()
          .order('xp_required');
      final earnedRows = await supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', userId);

      final earnedByBadgeId = {
        for (final row in earnedRows)
          row['badge_id'] as String: DateTime.parse(row['earned_at'] as String),
      };

      setState(() {
        _badges = (badgeRows as List).map((row) {
          final badge = BadgeItem.fromMap(row as Map<String, dynamic>);
          badge.earnedAt = earnedByBadgeId[badge.id];
          return badge;
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger les badges.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!));

    final dateFormat = DateFormat('dd/MM/yyyy');

    return RefreshIndicator(
      onRefresh: _load,
      child: GridView.builder(
        padding: const EdgeInsets.all(20),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.95,
        ),
        itemCount: _badges.length,
        itemBuilder: (context, index) {
          final badge = _badges[index];
          return Card(
            color: badge.isUnlocked
                ? null
                : AntaColors.slate200.withValues(alpha: 0.4),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Opacity(
                    opacity: badge.isUnlocked ? 1 : 0.4,
                    child: Text(
                      badge.icon,
                      style: const TextStyle(fontSize: 32),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    badge.name,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Text(
                      badge.description,
                      style: TextStyle(
                        fontSize: 12,
                        color: AntaColors.slate500,
                      ),
                      overflow: TextOverflow.fade,
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (!badge.isUnlocked) ...[
                        Icon(
                          Icons.lock_outline,
                          size: 12,
                          color: AntaColors.slate500,
                        ),
                        const SizedBox(width: 4),
                      ],
                      Flexible(
                        child: Text(
                          badge.isUnlocked
                              ? 'Débloqué le ${dateFormat.format(badge.earnedAt!)}'
                              : 'Non débloqué',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: badge.isUnlocked
                                ? AntaColors.green
                                : AntaColors.slate500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
