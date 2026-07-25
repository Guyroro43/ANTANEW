import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/apiAuth';
import { chatWithPracticePartner, type ChatTurn } from '@/lib/gemini';

const MAX_HISTORY_TURNS = 20;
const MAX_MESSAGE_LENGTH = 1000;

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedClient(request);

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('first_name, english_level').eq('id', user.id).single();

  const body = await request.json().catch(() => null);
  const message = String(body?.message ?? '').trim().slice(0, MAX_MESSAGE_LENGTH);
  const rawHistory = Array.isArray(body?.history) ? body.history : [];
  const history: ChatTurn[] = rawHistory
    .filter((turn: unknown): turn is ChatTurn => {
      return (
        typeof turn === 'object' &&
        turn !== null &&
        ((turn as ChatTurn).role === 'user' || (turn as ChatTurn).role === 'model') &&
        typeof (turn as ChatTurn).text === 'string'
      );
    })
    .slice(-MAX_HISTORY_TURNS);

  if (!message) {
    return NextResponse.json({ error: 'Message vide.' }, { status: 400 });
  }

  try {
    const reply = await chatWithPracticePartner({
      level: profile?.english_level ?? 'debutant',
      firstName: profile?.first_name ?? 'Apprenant',
      history,
      message,
    });
    return NextResponse.json({ reply });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Échec de la réponse IA.';
    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }
}
