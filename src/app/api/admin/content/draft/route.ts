import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { draftModuleFields, draftLessonFields } from '@/lib/gemini';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const canEditContent = profile && ['instructor', 'founder_instructor', 'developer'].includes(profile.role);
  if (!canEditContent) {
    return NextResponse.json({ error: 'Accès réservé aux instructeurs et développeurs.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const type = body?.type === 'lesson' ? 'lesson' : 'module';
  const brief = String(body?.brief ?? '').trim();
  const moduleTitle = String(body?.moduleTitle ?? '').trim();

  if (!brief) {
    return NextResponse.json({ error: 'Décris en quelques mots le contenu souhaité.' }, { status: 400 });
  }

  try {
    if (type === 'lesson') {
      const fields = await draftLessonFields({ brief, moduleTitle });
      return NextResponse.json(fields);
    }
    const fields = await draftModuleFields({ brief });
    return NextResponse.json(fields);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec de la génération IA.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
