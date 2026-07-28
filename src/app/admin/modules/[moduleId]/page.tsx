'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GripVertical } from 'lucide-react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { LessonForm } from '@/components/admin/LessonForm';
import { NotifyNewLessonModal } from '@/components/admin/NotifyNewLessonModal';
import { SortableItem } from '@/components/admin/SortableItem';
import { Icon, icons } from '@/components/ui/Icon';
import type { Module, Lesson, LessonInsert } from '@/types/module';

export default function Page() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [notifyLesson, setNotifyLesson] = useState<{ title: string } | null>(null);

  const loadData = async () => {
    const supabase = createClient();
    const [{ data: moduleData }, { data: lessonsData }] = await Promise.all([
      supabase.from('modules').select('*').eq('id', moduleId).single(),
      supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index'),
    ]);
    setCurrentModule(moduleData ?? null);
    setLessons(lessonsData ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const openCreate = () => {
    setEditingLesson(null);
    setModalOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Omit<LessonInsert, 'module_id'>) => {
    const supabase = createClient();
    const wasPublished = editingLesson?.is_published ?? false;
    if (editingLesson) {
      const { error } = await supabase.from('lessons').update(values).eq('id', editingLesson.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('lessons').insert({ ...values, module_id: moduleId });
      if (error) throw new Error(error.message);
    }
    setModalOpen(false);
    if (values.is_published && !wasPublished) {
      setNotifyLesson({ title: values.title });
    }
    await loadData();
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!window.confirm(`Supprimer la leçon « ${lesson.title} » ? Les questions associées seront aussi supprimées.`)) {
      return;
    }
    const supabase = createClient();
    await supabase.from('lessons').delete().eq('id', lesson.id);
    await loadData();
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lessons, oldIndex, newIndex).map((lesson, index) => ({ ...lesson, order_index: index }));
    setLessons(reordered);

    const supabase = createClient();
    await Promise.all(reordered.map((lesson) => supabase.from('lessons').update({ order_index: lesson.order_index }).eq('id', lesson.id)));
  };

  if (isLoading) {
    return (
      <main className="flex justify-center px-8 py-16">
        <Spinner size={32} />
      </main>
    );
  }

  if (!currentModule) {
    return (
      <main className="px-8 py-16 text-center">
        <p className="text-lg font-semibold">Module introuvable.</p>
        <Link href="/admin/modules" className="mt-4 inline-flex text-red-600 underline dark:text-yellow-400">
          Retour aux modules
        </Link>
      </main>
    );
  }

  return (
    <main className="px-8 py-10">
      <Link href="/admin/modules" className="text-sm font-semibold text-red-600 hover:underline dark:text-yellow-400">
        ← Retour aux modules
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">
            {currentModule.title}
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Leçons</h1>
        </div>
        <Button onClick={openCreate}>
          <Icon icon={icons.plus} className="h-4 w-4" />
          Nouvelle leçon
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {lessons.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">Aucune leçon pour ce module.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={lessons.map((lesson) => lesson.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-4">
                {lessons.map((lesson) => (
                  <SortableItem key={lesson.id} id={lesson.id}>
                    {(dragHandleProps, isDragging) => (
                      <Card className={`flex flex-wrap items-center justify-between gap-4 ${isDragging ? 'shadow-lg' : ''}`}>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            {...dragHandleProps}
                            aria-label="Réordonner cette leçon"
                            className="shrink-0 cursor-grab touch-none rounded p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                          {lesson.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={lesson.image_url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                          )}
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white">{lesson.title}</p>
                              <Badge variant={lesson.is_published ? 'success' : 'warning'}>
                                {lesson.is_published ? 'Publiée' : 'Brouillon'}
                              </Badge>
                              <Badge variant="default">{lesson.content_type.toUpperCase()}</Badge>
                              <Badge
                                variant={lesson.access_level === 'premium' ? 'destructive' : lesson.access_level === 'all' ? 'success' : 'default'}
                              >
                                {lesson.access_level === 'premium' ? 'Premium' : lesson.access_level === 'all' ? 'Tout le monde' : 'Gratuit'}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {lesson.category ?? 'Sans catégorie'} — {lesson.difficulty} — ordre {lesson.order_index}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/modules/${moduleId}/lecons/${lesson.id}`}>
                            <Button variant="outline" size="sm">
                              Questions
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => openEdit(lesson)}>
                            Éditer
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(lesson)}>
                            Supprimer
                          </Button>
                        </div>
                      </Card>
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingLesson ? 'Éditer la leçon' : 'Nouvelle leçon'}>
        <LessonForm
          key={editingLesson?.id ?? 'new'}
          initialValue={editingLesson ?? undefined}
          moduleTitle={currentModule?.title ?? ''}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <NotifyNewLessonModal
        open={notifyLesson !== null}
        onClose={() => setNotifyLesson(null)}
        lessonTitle={notifyLesson?.title ?? ''}
        moduleTitle={currentModule?.title ?? ''}
      />
    </main>
  );
}
