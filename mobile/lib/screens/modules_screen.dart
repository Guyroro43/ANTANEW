import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../models/module_item.dart';
import 'module_detail_screen.dart';

class ModulesScreen extends StatefulWidget {
  const ModulesScreen({super.key});

  @override
  State<ModulesScreen> createState() => _ModulesScreenState();
}

class _ModulesScreenState extends State<ModulesScreen> {
  bool _isLoading = true;
  bool _isPremiumUser = false;
  List<ModuleItem> _modules = [];
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
          .select('subscription_plan')
          .eq('id', userId)
          .single();
      final moduleRows = await supabase
          .from('modules')
          .select()
          .eq('is_published', true)
          .order('order_index');

      setState(() {
        _isPremiumUser = profileRow['subscription_plan'] == 'premium';
        _modules = (moduleRows as List)
            .map((row) => ModuleItem.fromMap(row))
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger les modules.';
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
    if (_modules.isEmpty) {
      return const Center(
        child: Text('Aucun module disponible pour le moment.'),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: _modules.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final module = _modules[index];
          final locked = module.isPremium && !_isPremiumUser;

          return Card(
            child: InkWell(
              borderRadius: BorderRadius.circular(20),
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
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            module.title,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: module.isPremium
                                ? AntaColors.yellow.withValues(alpha: 0.3)
                                : AntaColors.green.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            module.isPremium ? 'Premium' : 'Gratuit',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (module.description != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        module.description!,
                        style: TextStyle(color: AntaColors.slate500),
                      ),
                    ],
                    if (locked) ...[
                      const SizedBox(height: 8),
                      const Text(
                        '🔒 Réservé aux membres Premium',
                        style: TextStyle(
                          color: AntaColors.red,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
