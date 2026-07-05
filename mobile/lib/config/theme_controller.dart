import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _themeModePrefKey = 'anta_theme_mode';

/// Notifie AntaApp (main.dart) quand l'utilisateur change de thème
/// depuis l'écran Paramètres, et persiste le choix entre les lancements.
class ThemeController {
  static final ValueNotifier<ThemeMode> mode = ValueNotifier(ThemeMode.system);

  static Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_themeModePrefKey);
    mode.value = switch (stored) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  static Future<void> setMode(ThemeMode newMode) async {
    mode.value = newMode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeModePrefKey, newMode.name);
  }
}
