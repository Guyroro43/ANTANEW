import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';

class AbonnementScreen extends StatefulWidget {
  const AbonnementScreen({super.key});

  @override
  State<AbonnementScreen> createState() => _AbonnementScreenState();
}

class _AbonnementScreenState extends State<AbonnementScreen> {
  bool _isLoading = true;
  bool _isPremium = false;
  DateTime? _expiresAt;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final supabase = Supabase.instance.client;
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    final row = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_expires_at')
        .eq('id', userId)
        .single();

    setState(() {
      _isPremium = row['subscription_plan'] == 'premium';
      final expiresAtRaw = row['subscription_expires_at'] as String?;
      _expiresAt = expiresAtRaw != null ? DateTime.parse(expiresAtRaw) : null;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Row(
          children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: AntaColors.yellow.withValues(alpha: 0.25),
              child: const Icon(
                Icons.workspace_premium,
                color: Color(0xFFB45309),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                _isPremium ? 'Ton abonnement Premium' : 'Passe à Premium',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          _isPremium
              ? 'Tu profites de tous les modules premium.'
                    '${_expiresAt != null ? ' Valide jusqu\'au ${DateFormat('dd/MM/yyyy').format(_expiresAt!)}.' : ' Ton abonnement est actif.'}'
              : 'Accède à tous les modules premium et débloque un apprentissage plus complet avec des contenus avancés.',
          style: TextStyle(
            color: AntaColors.slate500,
            fontSize: 15,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 24),
        if (!_isPremium)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.lock_clock, color: AntaColors.red),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Choisir Premium — bientôt disponible (paiement Mobile Money via CinetPay)',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
