import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final FlutterLocalNotificationsPlugin _localNotifications =
    FlutterLocalNotificationsPlugin();

/// Doit être une fonction top-level (annotation @pragma requise par FCM pour
/// les messages reçus alors que l'app est tuée/en arrière-plan sur Android).
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Rien à faire ici : quand le payload contient un bloc "notification",
  // Android affiche déjà la notification système lui-même en arrière-plan.
}

class PushNotificationsService {
  static bool _initialized = false;

  /// Prépare la réception des notifications (handler arrière-plan + canal
  /// d'affichage au premier plan). À appeler une fois au démarrage de l'app,
  /// avant toute connexion utilisateur.
  static Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    await _localNotifications.initialize(
      const InitializationSettings(android: androidSettings),
    );

    // Android n'affiche pas nativement les notifications reçues pendant que
    // l'app est au premier plan : on les affiche nous-mêmes via une
    // notification locale.
    FirebaseMessaging.onMessage.listen((message) {
      final notification = message.notification;
      if (notification == null) return;
      _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'anta_default',
            'ANTA',
            importance: Importance.high,
            priority: Priority.high,
          ),
        ),
      );
    });
  }

  /// Demande la permission et enregistre le token FCM de cet appareil pour
  /// l'utilisateur connecté. Ne fait rien si la permission est refusée.
  static Future<void> registerDevice(String userId) async {
    final messaging = FirebaseMessaging.instance;
    final settings = await messaging.requestPermission();
    final authorized =
        settings.authorizationStatus == AuthorizationStatus.authorized ||
            settings.authorizationStatus == AuthorizationStatus.provisional;
    if (!authorized) return;

    final token = await messaging.getToken();
    if (token == null) return;

    await Supabase.instance.client.from('device_tokens').upsert(
      {'user_id': userId, 'token': token, 'platform': 'android'},
      onConflict: 'token',
    );
  }

  /// Supprime tous les tokens de cet utilisateur (ex: désactivation du
  /// réglage Notifications).
  static Future<void> unregisterAll(String userId) async {
    await Supabase.instance.client
        .from('device_tokens')
        .delete()
        .eq('user_id', userId);
  }
}
