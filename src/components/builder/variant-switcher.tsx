"use client";

import { useResume } from "@/lib/resume-store";
import { ResumeVariant } from "@/types/resume";
import { cn } from "@/lib/utils";

const VARIANTS: {
  value: ResumeVariant;
  label: string;
  emoji: string;
  tone: string;
  bullets: string[];
}[] = [
  {
    value: "startup",
    label: "Startup",
    emoji: "🚀",
    tone: "Ownership-driven",
    bullets: ["0→1 work", "Execution speed", "Founder mindset"],
  },
  {
    value: "bigtech",
    label: "Big Tech",
    emoji: "🏢",
    tone: "Systems & scale",
    bullets: ["A/B experiments", "OKRs & metrics", "Millions of users"],
  },
  {
    value: "international",
    label: "International",
    emoji: "🌍",
    tone: "Formal & precise",
    bullets: ["No idioms", "Explicit scope", "Global ATS-safe"],
  },
];

export function VariantSwitcher() {
  const { resume, updateResume } = useResume();

  function handleSwitch(variant: ResumeVariant) {
    if (variant === resume.variant) return;
    // Clear cached AI summary so it gets regenerated for new variant
    updateResume({ variant, aiSummary: "" });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Resume Variant
        </p>
        <p className="text-[10px] text-slate-400">
          Changes AI tone, bullet style &amp; skill suggestions
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {VARIANTS.map((v) => {
          const isActive = resume.variant === v.value;
          return (
            <button
              key={v.value}
              onClick={() => handleSwitch(v.value)}
              className={cn(
                "flex flex-col items-start gap-1.5 p-3 rounded-lg border-2 text-left transition-all",
                isActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{v.emoji}</span>
                <span className={cn("text-xs font-semibold", isActive ? "text-indigo-700" : "text-slate-700")}>
                  {v.label}
                </span>
              </div>
              <span className={cn("text-[10px] font-medium", isActive ? "text-indigo-500" : "text-slate-400")}>
                {v.tone}
              </span>
              <ul className="space-y-0.5">
                {v.bullets.map((b) => (
                  <li key={b} className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className={cn("w-1 h-1 rounded-full shrink-0", isActive ? "bg-indigo-400" : "bg-slate-300")} />
                    {b}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* What changes callout */}
      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 flex flex-wrap gap-x-4 gap-y-1">
        {[
          { label: "AI bullet tone", active: true },
          { label: "Skill suggestions", active: true },
          { label: "Summary voice", active: true },
          { label: "Layout", active: false },
        ].map(({ label, active }) => (
          <span key={label} className="flex items-center gap-1 text-[10px]">
            <span className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-emerald-400" : "bg-slate-300")} />
            <span className={active ? "text-slate-600" : "text-slate-400 line-through"}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
