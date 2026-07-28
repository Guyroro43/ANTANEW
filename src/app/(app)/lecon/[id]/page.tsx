import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeconRunner } from '@/components/lecon/LeconRunner';
import { LeconBlocksRunner } from '@/components/lecon/LeconBlocksRunner';
import { Reveal } from '@/components/ui/Reveal';

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: lesson } = await supabase.from('lessons').select('*').eq('id', params.id).single();

  if (!lesson) {
    redirect('/modules');
  }

  const usesBlocks = lesson.format === 'blocks';

  const [{ data: moduleRow }, { data: profile }, { data: questions }, { data: progress }, { data: vocabulary }, { data: blocks }] =
    await Promise.all([
      supabase.from('modules').select('slug, title').eq('id', lesson.module_id).single(),
      supabase.from('profiles').select('subscription_plan').eq('id', user.id).single(),
      usesBlocks
        ? Promise.resolve({ data: [] })
        : supabase.from('questions').select('*').eq('lesson_id', params.id).order('order_index', { ascending: true }),
      supabase.from('progress').select('completed').eq('user_id', user.id).eq('lesson_id', params.id).maybeSingle(),
      usesBlocks
        ? Promise.resolve({ data: [] })
        : supabase.from('lesson_vocabulary').select('*').eq('lesson_id', params.id).order('order_index', { ascending: true }),
      usesBlocks
        ? supabase
            .from('lesson_blocks')
            .select('*')
            .eq('lesson_id', params.id)
            .eq('status', 'approved')
            .order('order_index', { ascending: true })
        : Promise.resolve({ data: [] }),
    ]);

  const isPremiumUser = profile?.subscription_plan === 'premium';
  if (lesson.access_level === 'premium' && !isPremiumUser) {
    redirect('/abonnement');
  }

  const moduleSlug = moduleRow?.slug ?? '';

  let contentUrl = lesson.content_url;
  if (contentUrl && (lesson.content_type === 'video' || lesson.content_type === 'audio') && !/^https?:\/\//.test(contentUrl)) {
    const { data: signed } = await supabase.storage.from('lesson-media').createSignedUrl(contentUrl, 3600);
    contentUrl = signed?.signedUrl ?? null;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">
                {moduleRow?.title ?? 'Leçon'}
              </p>
              <h1 className="mt-3 text-3xl font-black">{lesson.title}</h1>
            </div>
            <Link
              href={`/modules/${moduleSlug}`}
              className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200"
            >
              ← Retour au module
            </Link>
          </div>

          {lesson.description && <p className="mt-4 text-slate-600 dark:text-slate-300">{lesson.description}</p>}
        </Reveal>

        <div className="mt-8">
          {usesBlocks ? (
            <LeconBlocksRunner lessonId={lesson.id} moduleSlug={moduleSlug} blocks={blocks ?? []} />
          ) : (
            <LeconRunner
              lessonId={lesson.id}
              moduleSlug={moduleSlug}
              contentType={lesson.content_type}
              contentUrl={contentUrl}
              questions={questions ?? []}
              vocabulary={vocabulary ?? []}
              alreadyCompleted={Boolean(progress?.completed)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
