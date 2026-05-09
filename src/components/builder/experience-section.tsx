"use client";

import { useResume } from "@/lib/resume-store";
import { ExperienceEntry } from "@/types/resume";
import { ExperienceEntryCard } from "./experience-entry";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { generateId } from "@/lib/utils";

export function ExperienceSection() {
  const { resume, updateResume } = useResume();

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Work Experience</h2>
          <p className="text-xs text-slate-400 mt-0.5">Add roles, then let AI rewrite your bullets</p>
        </div>
      </div>

      <div className="space-y-2">
        {resume.experience.map((entry, i) => (
          <ExperienceEntryCard
            key={entry.id}
            entry={entry}
            variant={resume.variant}
            index={i}
            onUpdate={(updated) => updateEntry(i, updated)}
            onDelete={() => deleteEntry(i)}
          />
        ))}
      </div>

      <Button variant="secondary" size="sm" onClick={addEntry} className="w-full gap-2">
        <Plus size={14} /> Add Role
      </Button>
    </div>
  );
}
