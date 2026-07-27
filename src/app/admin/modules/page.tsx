'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ModuleForm } from '@/components/admin/ModuleForm';
import { SortableItem } from '@/components/admin/SortableItem';
import { Icon, icons } from '@/components/ui/Icon';
import type { Module, ModuleInsert } from '@/types/module';

export default function Page() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const loadModules = async () => {
    const supabase = createClient();
    const [{ data: modulesData }, { data: lessonsData }] = await Promise.all([
      supabase.from('modules').select('*').order('order_index'),
      supabase.from('lessons').select('module_id'),
    ]);

    const counts: Record<string, number> = {};
    (lessonsData ?? []).forEach((lesson) => {
      counts[lesson.module_id] = (counts[lesson.module_id] ?? 0) + 1;
    });

    setModules(modulesData ?? []);
    setLessonCounts(counts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadModules();
  }, []);

  const openCreate = () => {
    setEditingModule(null);
    setModalOpen(true);
  };

  const openEdit = (module: Module) => {
    setEditingModule(module);
    setModalOpen(true);
  };

  const handleSubmit = async (values: ModuleInsert) => {
    const supabase = createClient();
    if (editingModule) {
      const { error } = await supabase.from('modules').update(values).eq('id', editingModule.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('modules').insert(values);
      if (error) throw new Error(error.message);
    }
    setModalOpen(false);
    await loadModules();
  };

  const handleDelete = async (module: Module) => {
    if (!window.confirm(`Supprimer le module « ${module.title} » ? Les leçons associées seront aussi supprimées.`)) {
      return;
    }
    const supabase = createClient();
    await supabase.from('modules').delete().eq('id', module.id);
    await loadModules();
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex);
    setModules(reordered);

    const supabase = createClient();
    await Promise.all(reordered.map((module, index) => supabase.from('modules').update({ order_index: index }).eq('id', module.id)));
  };

  return (
    <main className="px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Modules & Leçons</h1>
        </div>
        <Button onClick={openCreate}>
          <Icon icon={icons.plus} className="h-4 w-4" />
          Nouveau module
        </Button>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <Spinner />
        ) : modules.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">Aucun module pour l'instant.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map((module) => module.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {modules.map((module) => (
                  <SortableItem key={module.id} id={module.id}>
                    {(dragHandleProps, isDragging) => (
                      <Card className={`flex flex-col gap-4 ${isDragging ? 'shadow-lg' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white">{module.title}</p>
                              <Badge variant={module.is_published ? 'success' : 'warning'}>
                                {module.is_published ? 'Publié' : 'Brouillon'}
                              </Badge>
                              {module.is_premium ? <Badge variant="destructive">Premium</Badge> : null}
                            </div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {lessonCounts[module.id] ?? 0} leçon{(lessonCounts[module.id] ?? 0) > 1 ? 's' : ''} — {module.xp_reward} XP
                            </p>
                          </div>
                          <button
                            type="button"
                            {...dragHandleProps}
                            aria-label="Réordonner ce module"
                            className="shrink-0 cursor-grab touch-none rounded p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex flex-wrap gap-2">
                          <Link href={`/admin/modules/${module.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Leçons
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => openEdit(module)}>
                            Éditer
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(module)}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingModule ? 'Éditer le module' : 'Nouveau module'}>
        <ModuleForm
          key={editingModule?.id ?? 'new'}
          initialValue={editingModule ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </main>
  );
}
