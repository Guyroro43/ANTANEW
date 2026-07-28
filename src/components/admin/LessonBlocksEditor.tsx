'use client';

import { useEffect, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { SortableItem } from '@/components/admin/SortableItem';
import { NotionBlockForm } from '@/components/admin/NotionBlockForm';
import { QcmBlockForm } from '@/components/admin/QcmBlockForm';
import { Icon, icons } from '@/components/ui/Icon';
import type { LessonBlock, LessonBlockInsert, NotionBlockContent, QcmBlockContent } from '@/types/module';

interface LessonBlocksEditorProps {
  lessonId: string;
}

export function LessonBlocksEditor({ lessonId }: LessonBlocksEditorProps) {
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<'notion' | 'qcm' | null>(null);
  const [editingBlock, setEditingBlock] = useState<LessonBlock | null>(null);

  const loadBlocks = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('lesson_blocks').select('*').eq('lesson_id', lessonId).order('order_index');
    setBlocks(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const openCreate = (type: 'notion' | 'qcm') => {
    setEditingBlock(null);
    setModalType(type);
  };

  const openEdit = (block: LessonBlock) => {
    setEditingBlock(block);
    setModalType(block.block_type);
  };

  const handleSubmit = async (values: Omit<LessonBlockInsert, 'lesson_id'>) => {
    const supabase = createClient();
    if (editingBlock) {
      const { error } = await supabase.from('lesson_blocks').update(values).eq('id', editingBlock.id);
      if (error) throw new Error(error.message);
    } else {
      const nextOrderIndex = blocks.length > 0 ? Math.max(...blocks.map((b) => b.order_index)) + 1 : 0;
      const { error } = await supabase
        .from('lesson_blocks')
        .insert({ ...values, lesson_id: lessonId, order_index: nextOrderIndex });
      if (error) throw new Error(error.message);
    }
    setModalType(null);
    await loadBlocks();
  };

  const handleDelete = async (block: LessonBlock) => {
    if (!window.confirm('Supprimer ce bloc ?')) return;
    const supabase = createClient();
    await supabase.from('lesson_blocks').delete().eq('id', block.id);
    await loadBlocks();
  };

  const handleApprove = async (block: LessonBlock) => {
    const supabase = createClient();
    await supabase.from('lesson_blocks').update({ status: 'approved' }).eq('id', block.id);
    await loadBlocks();
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({ ...block, order_index: index }));
    setBlocks(reordered);

    const supabase = createClient();
    await Promise.all(
      reordered.map((block) => supabase.from('lesson_blocks').update({ order_index: block.order_index }).eq('id', block.id)),
    );
  };

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Contenu de la leçon</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCreate('notion')}>
            <Icon icon={icons.doc} className="h-4 w-4" />+ Bloc notion
          </Button>
          <Button variant="outline" onClick={() => openCreate('qcm')}>
            <Icon icon={icons.check} className="h-4 w-4" />+ Bloc QCM
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {blocks.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">
            Aucun bloc pour l&apos;instant. Ajoute une notion ou une question pour commencer.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableItem key={block.id} id={block.id}>
                  {(dragHandleProps, isDragging) => {
                    const notionContent = block.block_type === 'notion' ? (block.content as unknown as NotionBlockContent) : null;
                    const qcmContent = block.block_type === 'qcm' ? (block.content as unknown as QcmBlockContent) : null;
                    return (
                      <Card className={`flex flex-wrap items-center justify-between gap-4 ${isDragging ? 'shadow-lg' : ''}`}>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            {...dragHandleProps}
                            aria-label="Réordonner ce bloc"
                            className="shrink-0 cursor-grab touch-none rounded p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={block.block_type === 'notion' ? 'default' : 'success'}>
                                {block.block_type === 'notion' ? 'Notion' : 'QCM'}
                              </Badge>
                              {block.status === 'draft' && <Badge variant="warning">Brouillon</Badge>}
                            </div>
                            <p className="mt-1 font-bold text-slate-900 dark:text-white">
                              {notionContent?.title ?? qcmContent?.question_text ?? ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {block.status === 'draft' && (
                            <Button variant="secondary" size="sm" onClick={() => handleApprove(block)}>
                              Approuver
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => openEdit(block)}>
                            Éditer
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(block)}>
                            Supprimer
                          </Button>
                        </div>
                      </Card>
                    );
                  }}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Modal
        open={modalType === 'notion'}
        onClose={() => setModalType(null)}
        title={editingBlock ? 'Éditer le bloc notion' : 'Nouveau bloc notion'}
      >
        <NotionBlockForm
          key={editingBlock?.id ?? 'new-notion'}
          initialValue={editingBlock ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalType(null)}
        />
      </Modal>
      <Modal
        open={modalType === 'qcm'}
        onClose={() => setModalType(null)}
        title={editingBlock ? 'Éditer le bloc QCM' : 'Nouveau bloc QCM'}
      >
        <QcmBlockForm
          key={editingBlock?.id ?? 'new-qcm'}
          initialValue={editingBlock ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalType(null)}
        />
      </Modal>
    </div>
  );
}
