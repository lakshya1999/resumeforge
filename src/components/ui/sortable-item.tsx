"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  id: string;
  children: ReactNode;
  className?: string;
  handleClassName?: string;
}

export function SortableItem({ id, children, className, handleClassName }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-1.5 group",
        isDragging && "opacity-50 z-50",
        className
      )}
    >
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          "mt-2 p-0.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing",
          "opacity-0 group-hover:opacity-100 transition-opacity touch-none",
          handleClassName
        )}
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
