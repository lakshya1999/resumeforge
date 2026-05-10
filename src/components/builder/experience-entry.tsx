"use client";

import { useState } from "react";
import { ExperienceEntry as IExperienceEntry, ResumeVariant } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash2, Sparkles, Check, Plus, X } from "lucide-react";

interface Props {
  entry: IExperienceEntry;
  variant: ResumeVariant;
  onUpdate: (updated: IExperienceEntry) => void;
  onDelete: () => void;
  index: number;
}

const PROJECT_TYPES = [
  { value: "0to1", label: "0→1" },
  { value: "redesign", label: "Redesign" },
  { value: "growth", label: "Growth" },
  { value: "systems", label: "Design System" },
  { value: "other", label: "Other" },
] as const;

export function ExperienceEntryCard({ entry, variant, onUpdate, onDelete, index }: Props) {
  const [expanded, setExpanded] = useState(index === 0);
  const [generating, setGenerating] = useState(false);
  const [acceptedBullets, setAcceptedBullets] = useState<Set<number>>(new Set());

  function update(field: keyof IExperienceEntry, value: unknown) {
    onUpdate({ ...entry, [field]: value });
  }

  function updateRawBullet(i: number, value: string) {
    const next = [...entry.rawBullets];
    next[i] = value;
    onUpdate({ ...entry, rawBullets: next });
  }

  function addRawBullet() {
    onUpdate({ ...entry, rawBullets: [...entry.rawBullets, ""] });
  }

  function removeRawBullet(i: number) {
    onUpdate({ ...entry, rawBullets: entry.rawBullets.filter((_, idx) => idx !== i) });
  }

  function acceptBullet(i: number) {
    setAcceptedBullets((prev) => new Set([...prev, i]));
    const newRaw = [...entry.rawBullets];
    newRaw[i] = entry.aiBullets[i];
    onUpdate({ ...entry, rawBullets: newRaw, aiBullets: [] });
    setAcceptedBullets(new Set());
  }

  function acceptAllBullets() {
    onUpdate({ ...entry, rawBullets: [...entry.aiBullets], aiBullets: [] });
    setAcceptedBullets(new Set());
  }

  async function generateBullets() {
    const bullets = entry.rawBullets.filter((b) => b.trim());
    if (!bullets.length || !entry.role) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/generate-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawBullets: bullets,
          role: entry.role,
          company: entry.company,
          metrics: entry.metrics,
          projectType: entry.projectType,
          variant,
        }),
      });
      const data = await res.json();
      if (data.bullets) {
        onUpdate({ ...entry, aiBullets: data.bullets });
      }
    } finally {
      setGenerating(false);
    }
  }

  const hasRawContent = entry.rawBullets.some((b) => b.trim());

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {entry.role || "New Role"}{" "}
              {entry.company && <span className="text-slate-500">@ {entry.company}</span>}
            </p>
            {entry.aiBullets.length > 0 && (
              <Badge variant="success" className="mt-0.5">
                {entry.aiBullets.length} AI bullets ready
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-100">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Job Title"
              value={entry.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Senior Product Designer"
            />
            <Input
              label="Company"
              value={entry.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Testbook"
            />
            <Input
              label="Start Date"
              value={entry.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              placeholder="Jan 2022"
            />
            <div className="space-y-1">
              <Input
                label="End Date"
                value={entry.isCurrent ? "" : entry.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                placeholder="Mar 2024"
                disabled={entry.isCurrent}
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={entry.isCurrent}
                  onChange={(e) => update("isCurrent", e.target.checked)}
                  className="rounded"
                />
                Current role
              </label>
            </div>
          </div>

          {/* Project type + metrics */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Project Type</p>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => update("projectType", pt.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                    entry.projectType === pt.value
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  )}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Key Metrics (optional but powerful)"
            value={entry.metrics}
            onChange={(e) => update("metrics", e.target.value)}
            placeholder="e.g. improved activation by 32%, reduced drop-off by 18%, 2M+ users"
            hint="The AI will embed these into your bullets automatically"
          />

          {/* Raw bullets */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              What you did <span className="text-slate-400 normal-case font-normal">(rough notes — AI will rewrite)</span>
            </p>
            {entry.rawBullets.map((bullet, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    value={bullet}
                    onChange={(e) => updateRawBullet(i, e.target.value)}
                    placeholder="e.g. redesigned onboarding flow, users were dropping off"
                    className="min-h-[56px] text-sm"
                  />
                </div>
                {entry.rawBullets.length > 1 && (
                  <button
                    onClick={() => removeRawBullet(i)}
                    className="mt-1 p-1.5 text-slate-300 hover:text-red-400 transition-colors h-fit"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addRawBullet}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Plus size={13} /> Add bullet
            </button>
          </div>

          {/* AI Generate CTA */}
          <div className="flex items-center gap-3">
            <Button
              onClick={generateBullets}
              loading={generating}
              disabled={!hasRawContent || !entry.role}
              size="sm"
              className="gap-1.5"
            >
              <Sparkles size={13} />
              {generating ? "Rewriting with AI..." : "Rewrite with AI"}
            </Button>
            {!hasRawContent && (
              <p className="text-xs text-slate-400">Add at least one bullet above first</p>
            )}
          </div>

          {/* AI bullets output */}
          {entry.aiBullets.length > 0 && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-600" />
                  <p className="text-xs font-semibold text-indigo-700">AI-Optimized Bullets</p>
                </div>
                <Button size="sm" variant="primary" onClick={acceptAllBullets}>
                  Accept All
                </Button>
              </div>
              <div className="space-y-2">
                {entry.aiBullets.map((bullet, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3 p-3 rounded-lg bg-white border transition-all",
                      acceptedBullets.has(i) ? "border-emerald-300 bg-emerald-50" : "border-slate-200"
                    )}
                  >
                    <p className="flex-1 text-sm text-slate-700 leading-relaxed">{bullet}</p>
                    <button
                      onClick={() => acceptBullet(i)}
                      className="shrink-0 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <Check size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
