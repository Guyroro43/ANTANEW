import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/theme_controller.dart';
import '../services/push_notifications_service.dart';

class ParametresScreen extends StatefulWidget {
  const ParametresScreen({super.key});

  @override
  State<ParametresScreen> createState() => _ParametresScreenState();
}

class _ParametresScreenState extends State<ParametresScreen> {
  bool _isLoading = true;
  bool _notificationsEnabled = true;
  bool _isSaving = false;

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
        .select('notifications_enabled')
        .eq('id', userId)
        .single();
    setState(() {
      _notificationsEnabled = (row['notifications_enabled'] as bool?) ?? true;
      _isLoading = false;
    });
  }

  Future<void> _toggleNotifications(bool value) async {
    final previous = _notificationsEnabled;
    setState(() {
      _notificationsEnabled = value;
      _isSaving = true;
    });

    final supabase = Supabase.instance.client;
    final userId = supabase.auth.currentUser?.id;
    try {
      if (userId == null) return;
      await supabase
          .from('profiles')
          .update({'notifications_enabled': value})
          .eq('id', userId);
      if (value) {
        await PushNotificationsService.registerDevice(userId);
      } else {
        await PushNotificationsService.unregisterAll(userId);
      }
    } catch (e) {
      setState(() => _notificationsEnabled = previous);
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text(
          'Thème',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
        ),
        const SizedBox(height: 8),
        ValueListenableBuilder<ThemeMode>(
          valueListenable: ThemeController.mode,
          builder: (context, currentMode, _) {
            return SegmentedButton<ThemeMode>(
              segments: const [
                ButtonSegment(
                  value: ThemeMode.light,
                  icon: Icon(Icons.light_mode),
                  label: Text('Clair'),
                ),
                ButtonSegment(
                  value: ThemeMode.dark,
                  icon: Icon(Icons.dark_mode),
                  label: Text('Sombre'),
                ),
                ButtonSegment(
                  value: ThemeMode.system,
                  icon: Icon(Icons.settings_suggest),
                  label: Text('Auto'),
                ),
              ],
              selected: {currentMode},
              onSelectionChanged: (selection) =>
                  ThemeController.setMode(selection.first),
            );
          },
        ),
        const SizedBox(height: 24),
        Card(
          child: SwitchListTile(
            title: const Text('Notifications'),
            subtitle: Text(_notificationsEnabled ? 'Activées' : 'Désactivées'),
            value: _notificationsEnabled,
            onChanged: _isSaving ? null : _toggleNotifications,
          ),
        ),
      ],
    );
  }
}
