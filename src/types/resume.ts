export type ResumeVariant = "startup" | "bigtech" | "international";

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  rawBullets: string[];
  aiBullets: string[];
  metrics: string;
  projectType: "0to1" | "redesign" | "growth" | "systems" | "other";
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  impact: string;
  tools: string;
  aiBullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  year: string;
  notes: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
  aiSummary: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string[];
  education: EducationEntry[];
  variant: ResumeVariant;
}

export interface JDAnalysis {
  keywords: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
  atsScore: number;
}

export interface BulletGenerationResult {
  bullets: string[];
  keywords: string[];
}
