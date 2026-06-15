"use client";

import { useRef, useState } from "react";
import { useResume } from "@/lib/resume-store";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/utils";
import {
  ExperienceEntry,
  EducationEntry,
  ResumeData,
} from "@/types/resume";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

// Extract plain text from a PDF in the browser using pdf.js.
// Worker is pulled from a CDN pinned to the installed version so it
// works without any bundler/worker wiring (and on Netlify).
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text +=
      content.items
        .map((item) => ("str" in item ? (item as { str: string }).str : ""))
        .join(" ") + "\n";
  }
  return text;
}

type ParsedResume = Partial<
  Pick<
    ResumeData,
    "fullName" | "email" | "phone" | "location" | "linkedIn" | "portfolio" | "summary" | "skills"
  >
> & {
  experience?: Array<Partial<ExperienceEntry>>;
  education?: Array<Partial<EducationEntry>>;
};

export function ResumeUploader() {
  const { resume, updateResume } = useResume();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "parsing">("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const busy = status !== "idle";

  function hasExistingContent() {
    return Boolean(
      resume.fullName ||
        resume.summary ||
        resume.skills.length ||
        resume.experience.some((e) => e.role || e.company || e.rawBullets.some((b) => b.trim()))
    );
  }

  function mergeIntoResume(parsed: ParsedResume) {
    const partial: Partial<ResumeData> = {};

    if (parsed.fullName) partial.fullName = parsed.fullName;
    if (parsed.email) partial.email = parsed.email;
    if (parsed.phone) partial.phone = parsed.phone;
    if (parsed.location) partial.location = parsed.location;
    if (parsed.linkedIn) partial.linkedIn = parsed.linkedIn;
    if (parsed.portfolio) partial.portfolio = parsed.portfolio;
    if (parsed.summary) partial.summary = parsed.summary;
    if (parsed.skills?.length) partial.skills = parsed.skills.filter(Boolean);

    if (parsed.experience?.length) {
      partial.experience = parsed.experience.map((e) => {
        const rawBullets = (e.rawBullets ?? []).filter((b) => b && b.trim());
        return {
          id: generateId(),
          role: e.role ?? "",
          company: e.company ?? "",
          startDate: e.startDate ?? "",
          endDate: e.endDate ?? "",
          isCurrent: Boolean(e.isCurrent),
          rawBullets: rawBullets.length ? rawBullets : [""],
          aiBullets: [],
          metrics: e.metrics ?? "",
          projectType: e.projectType ?? "other",
        };
      });
    }

    if (parsed.education?.length) {
      partial.education = parsed.education.map((ed) => ({
        id: generateId(),
        degree: ed.degree ?? "",
        institution: ed.institution ?? "",
        year: ed.year ?? "",
        notes: ed.notes ?? "",
      }));
    }

    updateResume(partial);
  }

  async function handleFile(file: File) {
    setError("");
    setDone(false);

    if (hasExistingContent()) {
      const ok = window.confirm(
        "Importing will replace the details you've already filled in. Continue?"
      );
      if (!ok) return;
    }

    try {
      // 1. Extract raw text from the file
      setStatus("reading");
      let resumeText = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        resumeText = await extractPdfText(file);
      } else {
        resumeText = await file.text();
      }

      if (!resumeText.trim()) {
        throw new Error(
          "Couldn't read any text from this file. If it's a scanned/image PDF, try a text-based export."
        );
      }

      // 2. Send to AI to structure it
      setStatus("parsing");
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse resume");

      // 3. Prefill the form
      mergeIntoResume(data as ParsedResume);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while importing.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="hidden sm:flex w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 items-center justify-center shrink-0">
            <FileText size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-800">Start from your current resume</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a PDF and we&apos;ll auto-fill your details, experience, skills &amp; education — so you don&apos;t start from scratch.
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          loading={busy}
          onClick={() => inputRef.current?.click()}
          className="gap-1.5 shrink-0"
        >
          <Upload size={14} />
          {status === "reading"
            ? "Reading file..."
            : status === "parsing"
            ? "Extracting details..."
            : "Upload current resume"}
        </Button>
      </div>

      {done && !error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          <CheckCircle2 size={14} className="shrink-0" />
          Imported — review the fields below and tweak anything that didn&apos;t map perfectly.
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
