'use client';

import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useState } from 'react';

export interface KanbanItem { id: string; stage: string }

interface Props<T extends KanbanItem> {
  stages: { key: string; label: string }[];
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onMove: (itemId: string, fromStage: string, toStage: string) => Promise<void> | void;
  columnClassName?: string;
}

export function KanbanBoard<T extends KanbanItem>({ stages, items, renderCard, onMove, columnClassName }: Props<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const active = activeId ? items.find((i) => i.id === activeId) : null;

  function handleStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    if (!e.over) return;
    const overId = String(e.over.id);
    const item = items.find((i) => i.id === String(e.active.id));
    if (!item) return;
    // over may be a column id or another card; we use column id only
    const toStage = stages.find((s) => s.key === overId)?.key;
    if (!toStage || toStage === item.stage) return;
    await onMove(item.id, item.stage, toStage);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleStart} onDragEnd={handleEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {stages.map((s) => (
          <KanbanColumn key={s.key} stageKey={s.key} label={s.label} className={columnClassName}>
            {items.filter((i) => i.stage === s.key).map((i) => (
              <KanbanCard key={i.id} id={i.id}>
                {renderCard(i)}
              </KanbanCard>
            ))}
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>
        {active && (
          <div className="opacity-90 cursor-grabbing">
            {renderCard(active)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}


function KanbanColumn({ stageKey, label, children, className }: { stageKey: string; label: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: stageKey });
  const count = Array.isArray(children) ? children.length : (children ? 1 : 0);
  return (
    <div
      ref={setNodeRef}
      className={`glass rounded-xl p-3 transition-colors ${isOver ? 'ring-2 ring-electric-cyan/60 bg-electric-cyan/[0.04]' : ''} ${className ?? ''}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-mono uppercase tracking-wider text-soft-gray">{label}</span>
        <span className="text-xs text-electric-cyan font-mono">{count}</span>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}


function KanbanCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'opacity-30' : ''}`}
    >
      {children}
    </div>
  );
}
