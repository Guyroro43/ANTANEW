import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, icons } from '@/components/ui/Icon';
import { LessonsList, type LessonCardData } from '@/components/modules/LessonsList';

interface PageProps {
  params: { slug: string };
}

export default async function Page({ params }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: moduleRow } = await supabase
    .from('modules')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!moduleRow) {
    notFound();
  }

  const [{ data: profile }, { data: lessons }, { data: progressRows }] = await Promise.all([
    supabase.from('profiles').select('subscription_plan').eq('id', user.id).single(),
    supabase.from('lessons').select('*').eq('module_id', moduleRow.id).eq('is_published', true).order('order_index', { ascending: true }),
    supabase.from('progress').select('lesson_id, completed').eq('user_id', user.id),
  ]);

  const isPremiumUser = profile?.subscription_plan === 'premium';
  const moduleLocked = moduleRow.is_premium && !isPremiumUser;
  const completedSet = new Set((progressRows ?? []).filter((row) => row.completed).map((row) => row.lesson_id));

  const contentTypeLabels: Record<string, string> = {
    qcm: 'QCM',
    pdf: 'PDF',
    video: 'Vidéo',
    audio: 'Audio',
  };

  const lessonCards: LessonCardData[] = (lessons ?? []).map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category,
    contentType: lesson.content_type,
    contentTypeLabel: contentTypeLabels[lesson.content_type] ?? lesson.content_type,
    imageUrl: lesson.image_url,
    locked: lesson.access_level === 'premium' && !isPremiumUser,
    completed: completedSet.has(lesson.id),
  }));

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Module</p>
              <h1 className="mt-3 text-4xl font-black">{moduleRow.title}</h1>
              {moduleRow.description && <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">{moduleRow.description}</p>}
            </div>
            <Link
              href="/modules"
              className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200"
            >
              ← Retour aux modules
            </Link>
          </div>
        </Reveal>

        {moduleLocked ? (
          <Reveal delay={0.1}>
            <div className="mt-8 rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-center dark:border-yellow-700 dark:bg-slate-900">
              <p className="flex items-center justify-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                <Icon icon={icons.lock} className="h-5 w-5" />
                Ce module est réservé aux membres Premium.
              </p>
              <Link href="/abonnement" className="mt-4 inline-flex rounded-full bg-red-600 px-5 py-3 font-semibold text-white dark:bg-green-600">
                Voir l&apos;abonnement Premium
              </Link>
            </div>
          </Reveal>
        ) : lessonCards.length === 0 ? (
          <p className="mt-8 text-slate-600 dark:text-slate-300">Aucune leçon publiée pour l&apos;instant.</p>
        ) : (
          <LessonsList lessons={lessonCards} />
        )}
      </div>
    </main>
  );
}
