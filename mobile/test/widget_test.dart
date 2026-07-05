import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:anta_mobile/config/app_theme.dart';

void main() {
  test('AppTheme fournit un thème clair et un thème sombre', () {
    expect(AppTheme.light.brightness, Brightness.light);
    expect(AppTheme.dark.brightness, Brightness.dark);
  });
}
