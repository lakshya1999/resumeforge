"use client";

import { useResume } from "@/lib/resume-store";
import { Navbar } from "@/components/layout/navbar";
import { VariantSwitcher } from "@/components/builder/variant-switcher";
import { PersonalInfo } from "@/components/builder/personal-info";
import { ExperienceSection } from "@/components/builder/experience-section";
import { SkillsSection } from "@/components/builder/skills-section";
import { EducationSection } from "@/components/builder/education-section";
import { JDParser } from "@/components/jd/jd-parser";
import { ResumePreview } from "@/components/preview/resume-preview";
import { ExportBar } from "@/components/preview/export-bar";

export default function Home() {
  const { activeTab } = useResume();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6">
        {activeTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
            {/* Left: form panels */}
            <div className="space-y-4 min-w-0">
              <VariantSwitcher />
              <PersonalInfo />
              <ExperienceSection />
              <SkillsSection />
              <EducationSection />
            </div>

            {/* Right: sticky live preview */}
            <div className="space-y-3">
              <div className="lg:sticky lg:top-[72px]">
                <ExportBar />
                <div className="mt-3 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin rounded-xl">
                  <ResumePreview />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "jd" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900">Job Description Analyzer</h1>
              <p className="text-sm text-slate-500 mt-1">
                Paste any JD to find keyword gaps, get an ATS match score, and receive tailored improvement suggestions.
              </p>
            </div>
            <JDParser />
          </div>
        )}

        {activeTab === "preview" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Resume Preview</h1>
                <p className="text-xs text-slate-400 mt-0.5">ATS-safe · Single column · No graphics</p>
              </div>
              <ExportBar />
            </div>
            <ResumePreview />
          </div>
        )}
      </main>
    </div>
  );
}
