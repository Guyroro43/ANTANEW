import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminMessaging } from '@/lib/firebase-admin';

const CHUNK_SIZE = 500; // limite FCM par appel sendEachForMulticast

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile && ['instructor', 'founder', 'founder_instructor', 'developer'].includes(profile.role);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Accès réservé aux admins.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const messageBody = typeof body?.body === 'string' ? body.body.trim() : '';
  const target = body?.target === 'selected' ? 'selected' : body?.target === 'plan' ? 'plan' : 'all';
  const userIds: string[] = target === 'selected' && Array.isArray(body?.userIds) ? body.userIds : [];
  const plan = body?.plan === 'premium' ? 'premium' : body?.plan === 'starter' ? 'starter' : null;

  if (!title || !messageBody) {
    return NextResponse.json({ error: 'Titre et message requis.' }, { status: 400 });
  }
  if (target === 'selected' && userIds.length === 0) {
    return NextResponse.json({ error: 'Sélectionne au moins un destinataire.' }, { status: 400 });
  }
  if (target === 'plan' && !plan) {
    return NextResponse.json({ error: 'Plan cible manquant.' }, { status: 400 });
  }

  const admin = createAdminClient();

  // N'envoie qu'aux utilisateurs qui ont laissé les notifications activées
  // (profiles.notifications_enabled, réglable dans Paramètres).
  let tokenQuery = admin
    .from('device_tokens')
    .select('id, token, user_id, profiles!inner(notifications_enabled, subscription_plan)')
    .eq('profiles.notifications_enabled', true);
  if (target === 'selected') {
    tokenQuery = tokenQuery.in('user_id', userIds);
  } else if (target === 'plan' && plan) {
    tokenQuery = tokenQuery.eq('profiles.subscription_plan', plan);
  }
  const { data: deviceTokens, error: tokensError } = await tokenQuery;
  if (tokensError) {
    return NextResponse.json({ error: tokensError.message }, { status: 500 });
  }

  const recipientCount =
    target === 'all' ? new Set((deviceTokens ?? []).map((t) => t.user_id)).size
    : target === 'plan' ? new Set((deviceTokens ?? []).map((t) => t.user_id)).size
    : userIds.length;

  const tokens = (deviceTokens ?? []).map((t) => t.token);
  let sentCount = 0;
  let failedCount = 0;
  const invalidTokens: string[] = [];

  if (tokens.length > 0) {
    const messaging = getAdminMessaging();
    for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
      const chunk = tokens.slice(i, i + CHUNK_SIZE);
      const response = await messaging.sendEachForMulticast({
        tokens: chunk,
        notification: { title, body: messageBody },
      });
      sentCount += response.successCount;
      failedCount += response.failureCount;
      response.responses.forEach((res, index) => {
        if (!res.success && res.error) {
          const code = res.error.code;
          if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(chunk[index]);
          }
        }
      });
    }
  }

  if (invalidTokens.length > 0) {
    await admin.from('device_tokens').delete().in('token', invalidTokens);
  }

  const { error: historyError } = await admin.from('notification_broadcasts').insert({
    sender_id: user.id,
    title,
    body: messageBody,
    target,
    target_plan: target === 'plan' ? plan : null,
    recipient_count: recipientCount,
    sent_count: sentCount,
    failed_count: failedCount,
  });
  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  return NextResponse.json({ recipientCount, sentCount, failedCount, tokensTargeted: tokens.length });
}
