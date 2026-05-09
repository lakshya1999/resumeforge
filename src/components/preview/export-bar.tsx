"use client";

import { useResume } from "@/lib/resume-store";
import { useExport } from "@/hooks/use-export";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export function ExportBar() {
  const { resume } = useResume();
  const { exportPDF, exportDOCX, exporting } = useExport();

  return (
    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
      <p className="text-xs text-slate-500 flex-1">ATS-safe format · Single column · No graphics</p>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => exportDOCX(resume)}
        loading={exporting === "docx"}
        className="gap-1.5"
      >
        <FileText size={13} />
        DOCX
      </Button>
      <Button
        size="sm"
        onClick={() => exportPDF(resume)}
        loading={exporting === "pdf"}
        className="gap-1.5"
      >
        <Download size={13} />
        PDF
      </Button>
    </div>
  );
}
