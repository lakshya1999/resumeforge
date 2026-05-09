"use client";

import { useState } from "react";
import { useResume } from "@/lib/resume-store";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, AlertCircle, CheckCircle2 } from "lucide-react";

export function JDParser() {
  const { resume, jdAnalysis, setJDAnalysis } = useResume();
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzeJD() {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/parse-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, resumeSkills: resume.skills }),
      });
      const data = await res.json();
      setJDAnalysis(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target size={15} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-800">Job Description Analyzer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Paste any JD to find keyword gaps and get tailored suggestions</p>
        </CardHeader>
        <CardBody className="space-y-3">
          <Textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-[160px] text-sm font-mono"
          />
          <Button
            onClick={analyzeJD}
            loading={loading}
            disabled={!jdText.trim()}
            className="gap-2"
          >
            <Sparkles size={14} />
            Analyze JD
          </Button>
        </CardBody>
      </Card>

      {jdAnalysis && (
        <>
          {/* ATS Score */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">ATS Match Score</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{jdAnalysis.atsScore}%</p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={jdAnalysis.atsScore >= 70 ? "#10b981" : jdAnalysis.atsScore >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="3"
                      strokeDasharray={`${jdAnalysis.atsScore} ${100 - jdAnalysis.atsScore}`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${jdAnalysis.atsScore}%`,
                    background: jdAnalysis.atsScore >= 70 ? "#10b981" : jdAnalysis.atsScore >= 50 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {jdAnalysis.atsScore >= 70 ? "Strong match — keep optimizing" : jdAnalysis.atsScore >= 50 ? "Moderate match — add missing keywords" : "Low match — significant gaps to address"}
              </p>
            </CardBody>
          </Card>

          {/* Missing Keywords */}
          {jdAnalysis.missingKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle size={13} className="text-amber-500" />
                  <h3 className="text-sm font-medium text-slate-700">
                    Missing Keywords ({jdAnalysis.missingKeywords.length})
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-1.5">
                  {jdAnalysis.missingKeywords.map((kw) => (
                    <Badge key={kw} variant="warning">{kw}</Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Matched Keywords */}
          {jdAnalysis.matchedKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <h3 className="text-sm font-medium text-slate-700">
                    Matched Keywords ({jdAnalysis.matchedKeywords.length})
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-1.5">
                  {jdAnalysis.matchedKeywords.map((kw) => (
                    <Badge key={kw} variant="success">{kw}</Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Suggestions */}
          {jdAnalysis.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium text-slate-700">Actionable Suggestions</h3>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2.5">
                  {jdAnalysis.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
