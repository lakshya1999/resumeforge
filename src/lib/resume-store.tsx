"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ResumeData, ResumeVariant, JDAnalysis } from "@/types/resume";
import { generateId } from "./utils";

const defaultResume: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedIn: "",
  portfolio: "",
  summary: "",
  aiSummary: "",
  experience: [
    {
      id: "exp-1",
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
  projects: [],
  skills: [],
  education: [
    {
      id: "edu-1",
      degree: "",
      institution: "",
      year: "",
      notes: "",
    },
  ],
  variant: "startup",
};

interface ResumeContextType {
  resume: ResumeData;
  setResume: (r: ResumeData) => void;
  updateResume: (partial: Partial<ResumeData>) => void;
  jdAnalysis: JDAnalysis | null;
  setJDAnalysis: (a: JDAnalysis | null) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResumeState] = useState<ResumeData>(defaultResume);
  const [jdAnalysis, setJDAnalysis] = useState<JDAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("builder");

  function setResume(r: ResumeData) {
    setResumeState(r);
  }

  function updateResume(partial: Partial<ResumeData>) {
    setResumeState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <ResumeContext.Provider
      value={{ resume, setResume, updateResume, jdAnalysis, setJDAnalysis, activeTab, setActiveTab }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used inside ResumeProvider");
  return ctx;
}
