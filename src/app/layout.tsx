import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ResumeProvider } from "@/lib/resume-store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ResumeForge — ATS Resume Optimizer for Product Designers",
  description:
    "Transform your product design experience into ATS-optimized, recruiter-ready resumes with AI-powered bullet rewriting and keyword analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <ResumeProvider>{children}</ResumeProvider>
      </body>
    </html>
  );
}
