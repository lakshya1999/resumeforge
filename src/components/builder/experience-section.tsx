"use client";

import { useResume } from "@/lib/resume-store";
import { ExperienceEntry } from "@/types/resume";
import { ExperienceEntryCard } from "./experience-entry";
import { SortableItem } from "@/components/ui/sortable-item";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { generateId } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

export function ExperienceSection() {
  const { resume, updateResume } = useResume();

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  function addEntry() {
    updateResume({
      experience: [
        ...resume.experience,
        {
          id: generateId(),
          role: "",
          company: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          rawBullets: [""],
          aiBullets: [],
          metrics: "",
          projectType: "other",
        },
      ],
    });
  }

  function updateEntry(index: number, updated: ExperienceEntry) {
    const next = [...resume.experience];
    next[index] = updated;
    updateResume({ experience: next });
  }

  function deleteEntry(index: number) {
    updateResume({ experience: resume.experience.filter((_, i) => i !== index) });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = resume.experience.findIndex((e) => e.id === active.id);
    const newIndex = resume.experience.findIndex((e) => e.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      updateResume({ experience: arrayMove(resume.experience, oldIndex, newIndex) });
    }
  }

  const entryIds = resume.experience.map((e) => e.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Work Experience</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Drag ⠿ to reorder roles · Add roles, then let AI rewrite your bullets
          </p>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={entryIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {resume.experience.map((entry, i) => (
              <SortableItem key={entry.id} id={entry.id}>
                <ExperienceEntryCard
                  entry={entry}
                  variant={resume.variant}
                  index={i}
                  onUpdate={(updated) => updateEntry(i, updated)}
                  onDelete={() => deleteEntry(i)}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="secondary" size="sm" onClick={addEntry} className="w-full gap-2">
        <Plus size={14} /> Add Role
      </Button>
    </div>
  );
}
