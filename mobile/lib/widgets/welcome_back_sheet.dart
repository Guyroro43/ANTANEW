import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/app_theme.dart';

class NextLessonInfo {
  final String title;
  final VoidCallback onTap;

  NextLessonInfo({required this.title, required this.onTap});
}

Future<void> showWelcomeBackSheet(
  BuildContext context, {
  required String firstName,
  required int currentStreak,
  required bool streakIntact,
  required VoidCallback onContinuer,
  required VoidCallback onStreak,
  required VoidCallback onBadges,
  required VoidCallback onClassement,
  required VoidCallback onDismiss,
  NextLessonInfo? nextLesson,
}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
    ),
    builder: (sheetContext) {
      return Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Salut $firstName 👋',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        "Prêt(e) à apprendre aujourd'hui ?",
                        style: TextStyle(color: AntaColors.slate500),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {
                    onDismiss();
                    Navigator.of(sheetContext).pop();
                  },
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: _QuickAction(
                    icon: Icons.menu_book_outlined,
                    label: 'Continuer',
                    onTap: () {
                      onDismiss();
                      Navigator.of(sheetContext).pop();
                      onContinuer();
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickAction(
                    icon: Icons.local_fire_department,
                    label: 'Streak',
                    onTap: () {
                      onDismiss();
                      Navigator.of(sheetContext).pop();
                      onStreak();
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickAction(
                    icon: Icons.emoji_events_outlined,
                    label: 'Badges',
                    onTap: () {
                      onDismiss();
                      Navigator.of(sheetContext).pop();
                      onBadges();
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickAction(
                    icon: Icons.leaderboard_outlined,
                    label: 'Classement',
                    onTap: () {
                      onDismiss();
                      Navigator.of(sheetContext).pop();
                      onClassement();
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: AntaColors.slate200),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    child: Row(
                      children: [
                        Text(
                          'ROUTINE DU JOUR',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                            color: AntaColors.slate500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  _RoutineRow(label: 'Terminer une leçon', checked: false),
                  const Divider(height: 1),
                  _RoutineRow(
                    label: 'Garder ton streak de $currentStreak jour${currentStreak > 1 ? 's' : ''}',
                    checked: streakIntact,
                  ),
                ],
              ),
            ),
            if (nextLesson != null) ...[
              const SizedBox(height: 18),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AntaColors.red, AntaColors.yellow, AntaColors.green],
                  ),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'RECOMMANDÉ POUR TOI',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      nextLesson.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () {
                        onDismiss();
                        Navigator.of(sheetContext).pop();
                        nextLesson.onTap();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AntaColors.red,
                      ),
                      child: const Text('Commencer'),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 10),
            Center(
              child: TextButton(
                onPressed: () {
                  onDismiss();
                  Navigator.of(sheetContext).pop();
                },
                child: Text('Plus tard', style: TextStyle(color: AntaColors.slate500)),
              ),
            ),
          ],
        ),
      );
    },
  );
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: AntaColors.slate200),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: AntaColors.red),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class _RoutineRow extends StatelessWidget {
  final String label;
  final bool checked;

  const _RoutineRow({required this.label, required this.checked});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: checked ? AntaColors.green : Colors.transparent,
              border: Border.all(color: checked ? AntaColors.green : AntaColors.slate200, width: 2),
            ),
            child: checked ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}

String dismissKeyForToday() => 'anta_popup_dismissed_${DateFormat('yyyy-MM-dd').format(DateTime.now())}';
