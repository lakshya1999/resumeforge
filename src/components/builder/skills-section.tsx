"use client";

import { useState, KeyboardEvent } from "react";
import { useResume } from "@/lib/resume-store";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResumeVariant } from "@/types/resume";
import { X } from "lucide-react";

const VARIANT_SKILLS: Record<ResumeVariant, string[]> = {
  startup: [
    "Figma", "0→1 Product Design", "User Research", "Rapid Prototyping",
    "Design Systems", "Product Strategy", "Cross-functional Leadership",
    "Growth Design", "Usability Testing", "Mobile Design", "Wireframing",
    "Design Thinking", "Stakeholder Management", "MVP Definition",
  ],
  bigtech: [
    "Figma", "A/B Testing", "Design Systems", "User Research", "Amplitude",
    "Mixpanel", "SQL", "Data Analysis", "Experimentation", "OKRs",
    "Information Architecture", "Cross-functional Collaboration",
    "Scalable Design", "Accessibility (WCAG)", "Quantitative Research",
  ],
  international: [
    "Figma", "UX Design", "User Research", "Prototyping", "Design Systems",
    "Usability Testing", "Information Architecture", "Product Strategy",
    "Cross-functional Collaboration", "Wireframing", "Mobile Design",
    "Interaction Design", "Visual Design", "Stakeholder Communication",
  ],
};

export function SkillsSection() {
  const { resume, updateResume } = useResume();
  const [input, setInput] = useState("");

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || resume.skills.includes(trimmed)) return;
    updateResume({ skills: [...resume.skills, trimmed] });
    setInput("");
  }

  function removeSkill(skill: string) {
    updateResume({ skills: resume.skills.filter((s) => s !== skill) });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    }
  }

  const suggestions = VARIANT_SKILLS[resume.variant].filter(
    (s) => !resume.skills.includes(s)
  );

  const variantLabel: Record<ResumeVariant, string> = {
    startup: "🚀 Startup keywords",
    bigtech: "🏢 Big Tech keywords",
    international: "🌍 International ATS keywords",
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-slate-800">Skills</h2>
        <p className="text-xs text-slate-400 mt-0.5">Type and press Enter, or click suggestions</p>
      </CardHeader>
      <CardBody className="space-y-4">
        {resume.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-700"
              >
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <Input
          placeholder="Add a skill (press Enter)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <div>
          <p className="text-xs text-slate-400 mb-2">{variantLabel[resume.variant]}</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.slice(0, 12).map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="px-2 py-1 text-xs rounded-full border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
