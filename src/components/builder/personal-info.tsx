"use client";

import { useResume } from "@/lib/resume-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { useState } from "react";

export function PersonalInfo() {
  const { resume, updateResume } = useResume();
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  async function generateSummary() {
    setGeneratingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resume.fullName,
          experience: resume.experience.map((e) => ({ role: e.role, company: e.company })),
          skills: resume.skills,
          variant: resume.variant,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        updateResume({ aiSummary: data.summary });
      } else {
        setSummaryError(data.error || "No summary returned. Try again.");
      }
    } catch {
      setSummaryError("Request failed. Check your API key in .env.local.");
    } finally {
      setGeneratingSummary(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-slate-800">Personal Information</h2>
        <p className="text-xs text-slate-400 mt-0.5">Basic contact and identity details</p>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={resume.fullName}
          onChange={(e) => updateResume({ fullName: e.target.value })}
          placeholder="Priya Mehta"
          className="col-span-2"
        />
        <Input
          label="Email"
          type="email"
          value={resume.email}
          onChange={(e) => updateResume({ email: e.target.value })}
          placeholder="priya@example.com"
        />
        <Input
          label="Phone"
          value={resume.phone}
          onChange={(e) => updateResume({ phone: e.target.value })}
          placeholder="+91 98765 43210"
        />
        <Input
          label="Location"
          value={resume.location}
          onChange={(e) => updateResume({ location: e.target.value })}
          placeholder="Bangalore, India"
        />
        <Input
          label="LinkedIn URL"
          value={resume.linkedIn}
          onChange={(e) => updateResume({ linkedIn: e.target.value })}
          placeholder="linkedin.com/in/priya-mehta"
        />
        <Input
          label="Portfolio URL"
          value={resume.portfolio}
          onChange={(e) => updateResume({ portfolio: e.target.value })}
          placeholder="priya.design"
          className="col-span-2"
        />

        <div className="col-span-2 space-y-2">
          <Textarea
            label="Professional Summary"
            value={resume.summary}
            onChange={(e) => updateResume({ summary: e.target.value })}
            placeholder="Write your own, or generate one with AI below..."
            className="min-h-[80px]"
            hint="3 sentences max. Will be auto-placed at the top of your resume."
          />
          {resume.aiSummary && resume.aiSummary !== resume.summary && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-xs font-medium text-indigo-700 mb-1">AI Suggestion</p>
              <p className="text-sm text-slate-700 leading-relaxed">{resume.aiSummary}</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => updateResume({ summary: resume.aiSummary })}
              >
                Use this
              </Button>
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              onClick={generateSummary}
              loading={generatingSummary}
              disabled={!resume.fullName}
            >
              Generate AI Summary
            </Button>
            {!resume.fullName && (
              <p className="text-xs text-slate-400">Enter your name first</p>
            )}
            {summaryError && (
              <p className="text-xs text-red-500">{summaryError}</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
