"use client";

import { useResume } from "@/lib/resume-store";
import { formatDate } from "@/lib/utils";
import { ResumeData } from "@/types/resume";

// This component renders pure ATS-safe HTML — no icons, no colors, no tables
export function ResumePreview() {
  const { resume } = useResume();

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Preview header bar */}
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-emerald-400" />
        <span className="ml-2 text-slate-400 text-xs font-mono">resume-preview.pdf</span>
      </div>

      {/* ATS-safe document */}
      <div
        id="resume-document"
        className="font-serif text-[13px] leading-relaxed text-black bg-white px-12 py-10 min-h-[800px]"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        <ResumeDocument resume={resume} />
      </div>
    </div>
  );
}

export function ResumeDocument({ resume }: { resume: ResumeData }) {
  const displayBullets = (entry: { rawBullets: string[]; aiBullets: string[] }) =>
    entry.aiBullets.length > 0 ? entry.aiBullets : entry.rawBullets.filter((b) => b.trim());

  const hasExperience = resume.experience.some((e) => e.role);
  const hasEducation = resume.education.some((e) => e.degree || e.institution);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold uppercase tracking-widest">
          {resume.fullName || "Your Name"}
        </h1>
        <div className="mt-1 text-sm text-gray-700 flex flex-wrap justify-center gap-x-3 gap-y-0.5">
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>| {resume.phone}</span>}
          {resume.location && <span>| {resume.location}</span>}
          {resume.linkedIn && <span>| {resume.linkedIn}</span>}
          {resume.portfolio && <span>| {resume.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {(resume.summary || resume.aiSummary) && (
        <section>
          <SectionHeader>Professional Summary</SectionHeader>
          <p className="text-sm leading-relaxed">{resume.summary || resume.aiSummary}</p>
        </section>
      )}

      {/* Experience */}
      {hasExperience && (
        <section>
          <SectionHeader>Work Experience</SectionHeader>
          <div className="space-y-4">
            {resume.experience
              .filter((e) => e.role)
              .map((entry) => {
                const bullets = displayBullets(entry);
                return (
                  <div key={entry.id}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-sm">{entry.role}</span>
                        {entry.company && (
                          <span className="text-sm">, {entry.company}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 shrink-0 ml-4">
                        {entry.startDate ? formatDate(entry.startDate) : ""}
                        {entry.startDate ? " – " : ""}
                        {entry.isCurrent ? "Present" : entry.endDate ? formatDate(entry.endDate) : ""}
                      </span>
                    </div>
                    {bullets.length > 0 && (
                      <ul className="mt-1 space-y-0.5 list-disc list-outside ml-4">
                        {bullets.map((b, i) => (
                          <li key={i} className="text-sm leading-snug">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section>
          <SectionHeader>Skills</SectionHeader>
          <p className="text-sm">{resume.skills.join(" · ")}</p>
        </section>
      )}

      {/* Education */}
      {hasEducation && (
        <section>
          <SectionHeader>Education</SectionHeader>
          <div className="space-y-2">
            {resume.education
              .filter((e) => e.degree || e.institution)
              .map((entry) => (
                <div key={entry.id} className="flex justify-between">
                  <div>
                    <span className="font-bold text-sm">{entry.degree}</span>
                    {entry.institution && <span className="text-sm">, {entry.institution}</span>}
                    {entry.notes && <span className="text-sm text-gray-600"> — {entry.notes}</span>}
                  </div>
                  {entry.year && (
                    <span className="text-sm text-gray-600 shrink-0 ml-4">{entry.year}</span>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-2">
      {children}
    </h2>
  );
}
