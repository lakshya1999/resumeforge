"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ResumeData, JDAnalysis } from "@/types/resume";

const STORAGE_KEY = "resumeforge_v1";

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

function loadFromStorage(): ResumeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultResume;
    return { ...defaultResume, ...JSON.parse(raw) };
  } catch {
    return defaultResume;
  }
}

function saveToStorage(data: ResumeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — fail silently
  }
}

interface ResumeContextType {
  resume: ResumeData;
  setResume: (r: ResumeData) => void;
  updateResume: (partial: Partial<ResumeData>) => void;
  jdAnalysis: JDAnalysis | null;
  setJDAnalysis: (a: JDAnalysis | null) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  clearResume: () => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  // Start with defaultResume on server, load from localStorage on client
  const [resume, setResumeState] = useState<ResumeData>(defaultResume);
  const [hydrated, setHydrated] = useState(false);
  const [jdAnalysis, setJDAnalysis] = useState<JDAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("builder");

  // After mount, load saved data from localStorage
  useEffect(() => {
    setResumeState(loadFromStorage());
    setHydrated(true);
  }, []);

  // Autosave to localStorage on every change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveToStorage(resume);
    }
  }, [resume, hydrated]);

  function setResume(r: ResumeData) {
    setResumeState(r);
  }

  function updateResume(partial: Partial<ResumeData>) {
    setResumeState((prev) => ({ ...prev, ...partial }));
  }

  function clearResume() {
    localStorage.removeItem(STORAGE_KEY);
    setResumeState(defaultResume);
  }

  return (
    <ResumeContext.Provider
      value={{ resume, setResume, updateResume, jdAnalysis, setJDAnalysis, activeTab, setActiveTab, clearResume }}
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
