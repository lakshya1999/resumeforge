"use client";

import { useState } from "react";
import { ResumeData } from "@/types/resume";
import { formatDate } from "@/lib/utils";

export function useExport() {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  async function exportPDF(resume: ResumeData) {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const marginX = 60;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - marginX * 2;
      let y = 60;

      const checkPage = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage();
          y = 50;
        }
      };

      // Header
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      const nameText = resume.fullName || "Your Name";
      doc.text(nameText, pageWidth / 2, y, { align: "center" });
      y += 22;

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const contactParts = [resume.email, resume.phone, resume.location, resume.linkedIn, resume.portfolio].filter(Boolean);
      const contactLine = contactParts.join("  |  ");
      doc.text(contactLine, pageWidth / 2, y, { align: "center" });
      y += 8;

      doc.setLineWidth(1.5);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 14;

      const drawSection = (title: string) => {
        checkPage(30);
        doc.setFont("times", "bold");
        doc.setFontSize(11);
        doc.text(title.toUpperCase(), marginX, y);
        y += 4;
        doc.setLineWidth(0.5);
        doc.line(marginX, y, pageWidth - marginX, y);
        y += 12;
      };

      const drawText = (text: string, bold = false, fontSize = 10) => {
        doc.setFont("times", bold ? "bold" : "normal");
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, contentWidth);
        checkPage(lines.length * 13);
        doc.text(lines, marginX, y);
        y += lines.length * 13;
      };

      // Summary
      if (resume.summary || resume.aiSummary) {
        drawSection("Professional Summary");
        drawText(resume.summary || resume.aiSummary);
        y += 8;
      }

      // Experience
      const hasExp = resume.experience.some((e) => e.role);
      if (hasExp) {
        drawSection("Work Experience");
        for (const entry of resume.experience.filter((e) => e.role)) {
          checkPage(40);
          const dateStr = [
            entry.startDate ? formatDate(entry.startDate) : "",
            entry.isCurrent ? "Present" : entry.endDate ? formatDate(entry.endDate) : "",
          ]
            .filter(Boolean)
            .join(" – ");

          doc.setFont("times", "bold");
          doc.setFontSize(10.5);
          doc.text(`${entry.role}${entry.company ? ", " + entry.company : ""}`, marginX, y);
          doc.setFont("times", "normal");
          doc.setFontSize(10);
          if (dateStr) doc.text(dateStr, pageWidth - marginX, y, { align: "right" });
          y += 14;

          const bullets = entry.aiBullets.length > 0 ? entry.aiBullets : entry.rawBullets.filter((b) => b.trim());
          for (const bullet of bullets) {
            const bulletLines = doc.splitTextToSize("• " + bullet, contentWidth - 12);
            checkPage(bulletLines.length * 13);
            doc.text(bulletLines, marginX + 8, y);
            y += bulletLines.length * 13;
          }
          y += 6;
        }
      }

      // Skills
      if (resume.skills.length > 0) {
        drawSection("Skills");
        drawText(resume.skills.join(" · "));
        y += 8;
      }

      // Education
      const hasEdu = resume.education.some((e) => e.degree || e.institution);
      if (hasEdu) {
        drawSection("Education");
        for (const entry of resume.education.filter((e) => e.degree || e.institution)) {
          checkPage(30);
          doc.setFont("times", "bold");
          doc.setFontSize(10.5);
          doc.text(`${entry.degree}${entry.institution ? ", " + entry.institution : ""}`, marginX, y);
          doc.setFont("times", "normal");
          doc.setFontSize(10);
          if (entry.year) doc.text(entry.year, pageWidth - marginX, y, { align: "right" });
          y += 14;
          if (entry.notes) {
            drawText(entry.notes);
          }
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
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import("docx");
      const { saveAs } = await import("file-saver");

      const bullets = (entry: { rawBullets: string[]; aiBullets: string[] }) =>
        (entry.aiBullets.length > 0 ? entry.aiBullets : entry.rawBullets.filter((b) => b.trim()));

      const sectionHeading = (text: string) =>
        new Paragraph({
          text: text.toUpperCase(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "888888" } },
        });

      const children: InstanceType<typeof Paragraph>[] = [];

      // Name
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({ text: resume.fullName || "Your Name", bold: true, size: 36, font: "Times New Roman" }),
          ],
        })
      );

      // Contact
      const contactParts = [resume.email, resume.phone, resume.location, resume.linkedIn, resume.portfolio].filter(Boolean);
      if (contactParts.length) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: contactParts.join("  |  "), size: 18, font: "Times New Roman" })],
          })
        );
      }

      // Summary
      if (resume.summary || resume.aiSummary) {
        children.push(sectionHeading("Professional Summary"));
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: resume.summary || resume.aiSummary, size: 20, font: "Times New Roman" })],
          })
        );
      }

      // Experience
      const expEntries = resume.experience.filter((e) => e.role);
      if (expEntries.length) {
        children.push(sectionHeading("Work Experience"));
        for (const entry of expEntries) {
          const dateStr = [
            entry.startDate ? formatDate(entry.startDate) : "",
            entry.isCurrent ? "Present" : entry.endDate ? formatDate(entry.endDate) : "",
          ]
            .filter(Boolean)
            .join(" – ");

          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({ text: `${entry.role}${entry.company ? ", " + entry.company : ""}`, bold: true, size: 20, font: "Times New Roman" }),
                ...(dateStr ? [new TextRun({ text: `  ${dateStr}`, size: 20, font: "Times New Roman", color: "555555" })] : []),
              ],
            })
          );

          for (const b of bullets(entry)) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [new TextRun({ text: b, size: 20, font: "Times New Roman" })],
              })
            );
          }
        }
      }

      // Skills
      if (resume.skills.length) {
        children.push(sectionHeading("Skills"));
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: resume.skills.join(" · "), size: 20, font: "Times New Roman" })],
          })
        );
      }

      // Education
      const eduEntries = resume.education.filter((e) => e.degree || e.institution);
      if (eduEntries.length) {
        children.push(sectionHeading("Education"));
        for (const entry of eduEntries) {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({ text: `${entry.degree}${entry.institution ? ", " + entry.institution : ""}`, bold: true, size: 20, font: "Times New Roman" }),
                ...(entry.year ? [new TextRun({ text: `  ${entry.year}`, size: 20, font: "Times New Roman", color: "555555" })] : []),
              ],
            })
          );
          if (entry.notes) {
            children.push(
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ text: entry.notes, size: 18, color: "555555", font: "Times New Roman" })],
              })
            );
          }
        }
      }

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${(resume.fullName || "resume").replace(/\s+/g, "-").toLowerCase()}-resume.docx`;
      saveAs(blob, fileName);
    } finally {
      setExporting(null);
    }
  }

  return { exportPDF, exportDOCX, exporting };
}
