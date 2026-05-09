"use client";

import { useResume } from "@/lib/resume-store";
import { EducationEntry } from "@/types/resume";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { generateId } from "@/lib/utils";

export function EducationSection() {
  const { resume, updateResume } = useResume();

  function addEntry() {
    updateResume({
      education: [
        ...resume.education,
        { id: generateId(), degree: "", institution: "", year: "", notes: "" },
      ],
    });
  }

  function updateEntry(index: number, field: keyof EducationEntry, value: string) {
    const next = [...resume.education];
    next[index] = { ...next[index], [field]: value };
    updateResume({ education: next });
  }

  function deleteEntry(index: number) {
    updateResume({ education: resume.education.filter((_, i) => i !== index) });
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-slate-800">Education</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        {resume.education.map((entry, i) => (
          <div key={entry.id} className="space-y-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Degree / Program"
                value={entry.degree}
                onChange={(e) => updateEntry(i, "degree", e.target.value)}
                placeholder="B.Des in Design"
                className="col-span-2"
              />
              <Input
                label="Institution"
                value={entry.institution}
                onChange={(e) => updateEntry(i, "institution", e.target.value)}
                placeholder="IIT Guwahati"
              />
              <Input
                label="Graduation Year"
                value={entry.year}
                onChange={(e) => updateEntry(i, "year", e.target.value)}
                placeholder="2019"
              />
              <Input
                label="Notes (optional)"
                value={entry.notes}
                onChange={(e) => updateEntry(i, "notes", e.target.value)}
                placeholder="GPA, honors, relevant coursework..."
                className="col-span-2"
              />
            </div>
            {resume.education.length > 1 && (
              <button
                onClick={() => deleteEntry(i)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addEntry} className="w-full gap-2">
          <Plus size={14} /> Add Education
        </Button>
      </CardBody>
    </Card>
  );
}
