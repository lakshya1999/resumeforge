"use client";

import { useResume } from "@/lib/resume-store";
import { ResumeVariant } from "@/types/resume";
import { cn } from "@/lib/utils";

const VARIANTS: { value: ResumeVariant; label: string; description: string; emoji: string }[] = [
  {
    value: "startup",
    label: "Startup",
    description: "0→1, ownership, execution speed",
    emoji: "🚀",
  },
  {
    value: "bigtech",
    label: "Big Tech",
    description: "Scale, systems, experimentation",
    emoji: "🏢",
  },
  {
    value: "international",
    label: "International",
    description: "Formal, clear, ATS-clean",
    emoji: "🌍",
  },
];

export function VariantSwitcher() {
  const { resume, updateResume } = useResume();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Resume Variant
      </p>
      <div className="grid grid-cols-3 gap-2">
        {VARIANTS.map((v) => (
          <button
            key={v.value}
            onClick={() => updateResume({ variant: v.value })}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-center transition-all",
              resume.variant === v.value
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200 hover:border-slate-300 bg-white"
            )}
          >
            <span className="text-lg">{v.emoji}</span>
            <span
              className={cn(
                "text-xs font-semibold",
                resume.variant === v.value ? "text-indigo-700" : "text-slate-700"
              )}
            >
              {v.label}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">{v.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
