import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Mêmes couleurs que tailwind (red-600 / yellow-400 / green-600 / slate).
class AntaColors {
  static const red = Color(0xFFDC2626);
  static const yellow = Color(0xFFFACC15);
  static const green = Color(0xFF16A34A);
  static const slate900 = Color(0xFF0F172A);
  static const slate500 = Color(0xFF64748B);
  static const slate200 = Color(0xFFE2E8F0);
}

// Plus Jakarta Sans (titres) + Inter (corps), comme sur le web.
TextTheme _buildTextTheme(TextTheme base, Color color) {
  final headingStyle = GoogleFonts.plusJakartaSansTextTheme(
    base,
  ).apply(bodyColor: color, displayColor: color);
  final bodyStyle = GoogleFonts.interTextTheme(
    base,
  ).apply(bodyColor: color, displayColor: color);
  return bodyStyle.copyWith(
    displayLarge: headingStyle.displayLarge,
    displayMedium: headingStyle.displayMedium,
    displaySmall: headingStyle.displaySmall,
    headlineLarge: headingStyle.headlineLarge,
    headlineMedium: headingStyle.headlineMedium,
    headlineSmall: headingStyle.headlineSmall,
    titleLarge: headingStyle.titleLarge,
    titleMedium: headingStyle.titleMedium,
    titleSmall: headingStyle.titleSmall,
  );
}

class AppTheme {
  static ThemeData light = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: const Color(0xFFFFFDF5),
    textTheme: _buildTextTheme(
      ThemeData.light().textTheme,
      AntaColors.slate900,
    ),
    colorScheme: ColorScheme.fromSeed(
      seedColor: AntaColors.red,
      brightness: Brightness.light,
      primary: AntaColors.red,
      secondary: AntaColors.green,
      tertiary: AntaColors.yellow,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: AntaColors.slate900,
      elevation: 0,
      titleTextStyle: GoogleFonts.plusJakartaSans(
        color: AntaColors.slate900,
        fontSize: 18,
        fontWeight: FontWeight.w700,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AntaColors.red,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        textStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: Colors.white,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: AntaColors.slate200),
      ),
    ),
  );

  static ThemeData dark = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF020617),
    textTheme: _buildTextTheme(ThemeData.dark().textTheme, Colors.white),
    colorScheme: ColorScheme.fromSeed(
      seedColor: AntaColors.green,
      brightness: Brightness.dark,
      primary: AntaColors.green,
      secondary: AntaColors.yellow,
      tertiary: AntaColors.red,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: const Color(0xFF0F172A),
      foregroundColor: Colors.white,
      elevation: 0,
      titleTextStyle: GoogleFonts.plusJakartaSans(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.w700,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AntaColors.green,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        textStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: const Color(0xFF0F172A),
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
  );
}
