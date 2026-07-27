import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'config/supabase_config.dart';
import 'config/app_theme.dart';
import 'config/theme_controller.dart';
import 'screens/app_shell.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/placement_test_screen.dart';
import 'services/push_notifications_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: SupabaseConfig.url,
    publishableKey: SupabaseConfig.anonKey,
  );
  await ThemeController.load();

  // Firebase (notifications push) : tant que google-services.json n'est pas
  // configuré côté Android, l'initialisation échoue silencieusement plutôt
  // que de bloquer le lancement de l'app.
  try {
    await Firebase.initializeApp();
    await PushNotificationsService.initialize();
  } catch (_) {}

  runApp(const AntaApp());
}

class AntaApp extends StatelessWidget {
  const AntaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: ThemeController.mode,
      builder: (context, mode, _) {
        return MaterialApp(
          title: 'ANTA',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: mode,
          home: const AuthGate(),
        );
      },
    );
  }
}

/// Bascule automatiquement entre l'écran de connexion, le test de niveau
/// (s'il n'est pas encore fait) et l'app, en écoutant les changements de
/// session Supabase.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        final session = Supabase.instance.client.auth.currentSession;
        if (session == null) {
          return const LoginScreen();
        }
        return _PlacementGate(userId: session.user.id);
      },
    );
  }
}

class _PlacementGate extends StatefulWidget {
  final String userId;
  const _PlacementGate({required this.userId});

  @override
  State<_PlacementGate> createState() => _PlacementGateState();
}

class _PlacementGateState extends State<_PlacementGate> {
  late Future<bool> _placementCompletedFuture;

  @override
  void initState() {
    super.initState();
    _placementCompletedFuture = _checkPlacementCompleted();
  }

  Future<bool> _checkPlacementCompleted() async {
    // Une nouvelle inscription (surtout via Google, plus rapide qu'un email
    // à confirmer) peut arriver ici avant que le trigger de création de
    // profil n'ait fini de s'exécuter côté base — on retente une fois avant
    // d'abandonner, pour ne pas sauter le test par erreur de timing.
    for (var attempt = 0; attempt < 2; attempt++) {
      try {
        final row = await Supabase.instance.client
            .from('profiles')
            .select('placement_test_completed')
            .eq('id', widget.userId)
            .single();
        return row['placement_test_completed'] as bool? ?? true;
      } catch (_) {
        if (attempt == 0) await Future.delayed(const Duration(seconds: 1));
      }
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _placementCompletedFuture,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        if (snapshot.data == false) {
          return const PlacementTestScreen();
        }
        return const AppShell();
      },
    );
  }
}
