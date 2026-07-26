import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/apiAuth';
import { synthesizeSpeech } from '@/lib/googleTts';
import { getPersona } from '@/lib/personas';

const MAX_TEXT_LENGTH = 2000;

export async function POST(request: Request) {
  const { user } = await getAuthenticatedClient(request);

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = String(body?.text ?? '').trim().slice(0, MAX_TEXT_LENGTH);
  const personaId = String(body?.personaId ?? 'kora');

  if (!text) {
    return NextResponse.json({ error: 'Texte vide.' }, { status: 400 });
  }

  try {
    const segments = await synthesizeSpeech(text, getPersona(personaId));
    return NextResponse.json({ segments });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec de la synthèse vocale.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
