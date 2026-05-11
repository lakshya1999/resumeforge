"use client";

import { useState } from "react";
import { ResumeData } from "@/types/resume";
import { formatDate } from "@/lib/utils";

// Replace characters jsPDF's built-in fonts can't render — they cause letter-spacing overflow
function sanitize(text: string): string {
  return text
    .replace(/₹/g, "Rs.")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/–/g, "-")   // en dash
    .replace(/—/g, "--")  // em dash
    .replace(/’/g, "'")   // right single quote
    .replace(/‘/g, "'")   // left single quote
    .replace(/“/g, '"')   // left double quote
    .replace(/”/g, '"')   // right double quote
    .replace(/…/g, "...") // ellipsis
    .replace(/[^\x00-\xFF]/g, ""); // strip any remaining non-Latin-1
}

export function useExport() {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  async function exportPDF(resume: ResumeData) {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const marginX = 60;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const contentW = pageW - marginX * 2; // 492pt
      let y = 60;

      const checkPage = (needed: number) => {
        if (y + needed > pageH - 50) {
          doc.addPage();
          y = 50;
        }
      };

      // ── Header ────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(sanitize(resume.fullName || "Your Name"), pageW / 2, y, { align: "center" });
      y += 20;

      // Contact line with hyperlinks
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);

      type ContactItem = { label: string; url?: string };
      const contactItems: ContactItem[] = [
        resume.email ? { label: resume.email, url: `mailto:${resume.email}` } : null,
        resume.phone ? { label: resume.phone } : null,
        resume.location ? { label: resume.location } : null,
        resume.linkedIn ? { label: resume.linkedIn, url: resume.linkedIn.startsWith("http") ? resume.linkedIn : `https://${resume.linkedIn}` } : null,
        resume.portfolio ? { label: resume.portfolio, url: resume.portfolio.startsWith("http") ? resume.portfolio : `https://${resume.portfolio}` } : null,
      ].filter(Boolean) as ContactItem[];

      if (contactItems.length) {
        const separator = "  |  ";
        const sepW = doc.getTextWidth(separator);
        const totalW = contactItems.reduce((sum, item, i) =>
          sum + doc.getTextWidth(item.label) + (i < contactItems.length - 1 ? sepW : 0), 0);
        let cx = (pageW - totalW) / 2;

        contactItems.forEach((item, i) => {
          const w = doc.getTextWidth(item.label);
          if (item.url) {
            doc.setTextColor(17, 85, 204); // blue for links
            doc.text(item.label, cx, y);
            doc.link(cx, y - 9, w, 11, { url: item.url });
            doc.setTextColor(0, 0, 0);
          } else {
            doc.text(item.label, cx, y);
          }
          cx += w;
          if (i < contactItems.length - 1) {
            doc.text(separator, cx, y);
            cx += sepW;
          }
        });
        y += 6;
      }

      // Divider
      doc.setLineWidth(1.5);
      doc.line(marginX, y + 4, pageW - marginX, y + 4);
      y += 16;

      // ── Section heading ────────────────────────────────────────
      const drawSection = (title: string) => {
        checkPage(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text(title.toUpperCase(), marginX, y);
        y += 3;
        doc.setLineWidth(0.5);
        doc.line(marginX, y, pageW - marginX, y);
        y += 11;
      };

      // ── Body text helper ───────────────────────────────────────
      const drawText = (raw: string, bold = false, fontSize = 9.5, indent = 0) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(sanitize(raw), contentW - indent);
        checkPage(lines.length * 13);
        doc.text(lines, marginX + indent, y);
        y += lines.length * 13;
      };

      // ── Summary ────────────────────────────────────────────────
      if (resume.summary || resume.aiSummary) {
        drawSection("Professional Summary");
        drawText(resume.summary || resume.aiSummary);
        y += 8;
      }

      // ── Work Experience ────────────────────────────────────────
      const expEntries = resume.experience.filter((e) => e.role);
      if (expEntries.length) {
        drawSection("Work Experience");
        for (const entry of expEntries) {
          checkPage(40);

          const dateStr = [
            entry.startDate ? formatDate(entry.startDate) : "",
            entry.isCurrent ? "Present" : entry.endDate ? formatDate(entry.endDate) : "",
          ].filter(Boolean).join(" – ");

          const roleCompany = sanitize(`${entry.role}${entry.company ? ", " + entry.company : ""}`);
          const dateClean = sanitize(dateStr);

          // Role + date on same line
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(roleCompany, marginX, y);
          if (dateClean) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.text(dateClean, pageW - marginX, y, { align: "right" });
          }
          y += 14;

          // Bullets — indent 12pt, width shrunk accordingly
          const bulletIndent = 12;
          const bulletW = contentW - bulletIndent - 4;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);

          const bullets = entry.aiBullets.length > 0
            ? entry.aiBullets
            : entry.rawBullets.filter((b) => b.trim());

          for (const bullet of bullets) {
            const lines = doc.splitTextToSize(sanitize(bullet), bulletW);
            checkPage(lines.length * 13);
            // Bullet dot
            doc.text("•", marginX + 2, y);
            // Text starts after dot
            doc.text(lines, marginX + bulletIndent, y);
            y += lines.length * 13;
          }
          y += 6;
        }
      }

      // ── Skills ─────────────────────────────────────────────────
      if (resume.skills.length) {
        drawSection("Skills");
        drawText(resume.skills.join(" · "));
        y += 8;
      }

      // ── Education ──────────────────────────────────────────────
      const eduEntries = resume.education.filter((e) => e.degree || e.institution);
      if (eduEntries.length) {
        drawSection("Education");
        for (const entry of eduEntries) {
          checkPage(30);
          const degreeInst = sanitize(`${entry.degree}${entry.institution ? ", " + entry.institution : ""}`);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(degreeInst, marginX, y);
          if (entry.year) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.text(sanitize(entry.year), pageW - marginX, y, { align: "right" });
          }
          y += 14;
          if (entry.notes) drawText(entry.notes);
        }
      }

      const fileName = `${(resume.fullName || "resume").replace(/\s+/g, "-").toLowerCase()}-resume.pdf`;
      doc.save(fileName);
    } finally {
      setExporting(null);
    }
  }

  async function exportDOCX(resume: ResumeData) {
    setExporting("docx");
    try {
      const {
        Document, Packer, Paragraph, TextRun, HeadingLevel,
        AlignmentType, BorderStyle, ExternalHyperlink,
      } = await import("docx");
      const { saveAs } = await import("file-saver");

      const getBullets = (entry: { rawBullets: string[]; aiBullets: string[] }) =>
        entry.aiBullets.length > 0 ? entry.aiBullets : entry.rawBullets.filter((b) => b.trim());

      const sectionHeading = (text: string) =>
        new Paragraph({
          text: text.toUpperCase(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "888888" } },
        });

      const children: InstanceType<typeof Paragraph>[] = [];

      // Name
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: resume.fullName || "Your Name", bold: true, size: 36, font: "Calibri" })],
      }));

      // Contact with hyperlinks
      type ContactRun = { label: string; url?: string };
      const contactItems: ContactRun[] = [
        resume.email ? { label: resume.email, url: `mailto:${resume.email}` } : null,
        resume.phone ? { label: resume.phone } : null,
        resume.location ? { label: resume.location } : null,
        resume.linkedIn ? { label: resume.linkedIn, url: resume.linkedIn.startsWith("http") ? resume.linkedIn : `https://${resume.linkedIn}` } : null,
        resume.portfolio ? { label: resume.portfolio, url: resume.portfolio.startsWith("http") ? resume.portfolio : `https://${resume.portfolio}` } : null,
      ].filter(Boolean) as ContactRun[];

      if (contactItems.length) {
        const runs = contactItems.flatMap((item, i) => {
          const sep = i < contactItems.length - 1
            ? [new TextRun({ text: "  |  ", size: 18, font: "Calibri" })]
            : [];
          if (item.url) {
            return [
              new ExternalHyperlink({
                link: item.url,
                children: [new TextRun({ text: item.label, size: 18, font: "Calibri", color: "1155CC", underline: {} })],
              }),
              ...sep,
            ];
          }
          return [new TextRun({ text: item.label, size: 18, font: "Calibri" }), ...sep];
        });

        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: runs,
        }));
      }

      // Summary
      if (resume.summary || resume.aiSummary) {
        children.push(sectionHeading("Professional Summary"));
        children.push(new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: resume.summary || resume.aiSummary, size: 20, font: "Calibri" })],
        }));
      }

      // Experience
      const expEntries = resume.experience.filter((e) => e.role);
      if (expEntries.length) {
        children.push(sectionHeading("Work Experience"));
        for (const entry of expEntries) {
          const dateStr = [
            entry.startDate ? formatDate(entry.startDate) : "",
            entry.isCurrent ? "Present" : entry.endDate ? formatDate(entry.endDate) : "",
          ].filter(Boolean).join(" – ");

          children.push(new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${entry.role}${entry.company ? ", " + entry.company : ""}`, bold: true, size: 20, font: "Calibri" }),
              ...(dateStr ? [new TextRun({ text: `  ${dateStr}`, size: 20, font: "Calibri", color: "555555" })] : []),
            ],
          }));

          for (const b of getBullets(entry)) {
            children.push(new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [new TextRun({ text: b, size: 20, font: "Calibri" })],
            }));
          }
        }
      }

      // Skills
      if (resume.skills.length) {
        children.push(sectionHeading("Skills"));
        children.push(new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: resume.skills.join(" · "), size: 20, font: "Calibri" })],
        }));
      }

      // Education
      const eduEntries = resume.education.filter((e) => e.degree || e.institution);
      if (eduEntries.length) {
        children.push(sectionHeading("Education"));
        for (const entry of eduEntries) {
          children.push(new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${entry.degree}${entry.institution ? ", " + entry.institution : ""}`, bold: true, size: 20, font: "Calibri" }),
              ...(entry.year ? [new TextRun({ text: `  ${entry.year}`, size: 20, font: "Calibri", color: "555555" })] : []),
            ],
          }));
          if (entry.notes) {
            children.push(new Paragraph({
              spacing: { after: 60 },
              children: [new TextRun({ text: entry.notes, size: 18, color: "555555", font: "Calibri" })],
            }));
          }
        }
      }

      const docx = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(docx);
      const fileName = `${(resume.fullName || "resume").replace(/\s+/g, "-").toLowerCase()}-resume.docx`;
      saveAs(blob, fileName);
    } finally {
      setExporting(null);
    }
  }

  return { exportPDF, exportDOCX, exporting };
}
