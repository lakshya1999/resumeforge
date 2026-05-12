"use client";

import { useState } from "react";
import { ResumeData } from "@/types/resume";
import { formatDate } from "@/lib/utils";

// Strip characters Times New Roman can't render — prevents letter-spacing overflow bug
function sanitize(text: string): string {
  return text
    .replace(/₹/g, "Rs.")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/–/g, "-")
    .replace(/—/g, "--")
    .replace(/'/g, "'").replace(/'/g, "'")
    .replace(/"/g, '"').replace(/"/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "");
}

export function useExport() {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  async function exportPDF(resume: ResumeData) {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pageW  = doc.internal.pageSize.getWidth();  // 612
      const pageH  = doc.internal.pageSize.getHeight(); // 792
      const mX     = 50;   // horizontal margin — matches preview px-12
      const mY     = 44;   // top margin — matches preview py-10
      const contW       = pageW - mX * 2; // 512pt usable width
      const lineH       = 16.5; // leading-relaxed (1.625 × 10pt) — body text
      const bulletLineH = 14;   // leading-snug   (1.375 × 10pt) — bullets
      const sectionGap  = 16;   // space-y-4 between sections
      let y = mY;

      const checkPage = (needed: number) => {
        if (y + needed > pageH - mY) { doc.addPage(); y = mY; }
      };

      // ── Helpers ────────────────────────────────────────────────────

      const setColor = (gray: number) => doc.setTextColor(gray, gray, gray);

      const wrapText = (raw: string, maxW: number) =>
        doc.splitTextToSize(sanitize(raw), maxW);

      // ── NAME (text-2xl bold uppercase tracking-widest centered) ───
      doc.setFont("times", "bold");
      doc.setFontSize(20);
      doc.setCharSpace(2.5); // tracking-widest
      setColor(0);
      const nameStr = sanitize(resume.fullName || "Your Name").toUpperCase();
      // Measure AFTER setCharSpace so width includes letter-spacing, then center manually
      const nameW = doc.getTextWidth(nameStr);
      doc.text(nameStr, (pageW - nameW) / 2, y);
      doc.setCharSpace(0); // reset
      y += 22;

      // ── CONTACT LINE (text-sm gray centered, with hyperlinks) ─────
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      setColor(55); // text-gray-700 ≈ #374151

      type ContactItem = { label: string; url?: string };
      const rawContacts: (ContactItem | null)[] = [
        resume.email    ? { label: resume.email,    url: `mailto:${resume.email}` } : null,
        resume.phone    ? { label: resume.phone } : null,
        resume.location ? { label: resume.location } : null,
        resume.linkedIn ? { label: resume.linkedIn, url: resume.linkedIn.startsWith("http") ? resume.linkedIn : `https://${resume.linkedIn}` } : null,
        resume.portfolio? { label: resume.portfolio, url: resume.portfolio.startsWith("http") ? resume.portfolio : `https://${resume.portfolio}` } : null,
      ];
      const contacts = rawContacts.filter(Boolean) as ContactItem[];

      if (contacts.length) {
        const sep = " | ";
        const sepW = doc.getTextWidth(sep);
        const totalW = contacts.reduce((sum, c, i) =>
          sum + doc.getTextWidth(c.label) + (i < contacts.length - 1 ? sepW : 0), 0);
        let cx = (pageW - totalW) / 2;

        contacts.forEach((c, i) => {
          const w = doc.getTextWidth(c.label);
          if (c.url) {
            setColor(17); // dark blue for links
            doc.text(c.label, cx, y);
            // Underline
            doc.setDrawColor(17, 17, 17);
            doc.setLineWidth(0.4);
            doc.line(cx, y + 1.5, cx + w, y + 1.5);
            // Clickable area
            doc.link(cx, y - 9, w, 12, { url: c.url });
            setColor(55);
          } else {
            doc.text(c.label, cx, y);
          }
          cx += w;
          if (i < contacts.length - 1) { doc.text(sep, cx, y); cx += sepW; }
        });
        y += 12; // gap after contact line
      }

      // Thick black border-b-2 border-black — pb-3 from header div
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.5);
      doc.line(mX, y, pageW - mX, y);
      y += sectionGap; // space before first section

      // ── Section header: bold uppercase, pb-0.5, thin gray line, mb-2 ──
      const drawSectionHeader = (title: string) => {
        checkPage(32);
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.setCharSpace(0.8); // tracking-wider
        setColor(0);
        doc.text(title.toUpperCase(), mX, y);
        doc.setCharSpace(0);
        y += 4;  // pb-0.5 (2px) approximated
        doc.setDrawColor(156, 163, 175); // border-gray-400
        doc.setLineWidth(0.5);
        doc.line(mX, y, pageW - mX, y);
        y += 10; // mb-2 (8px)
      };

      // ── Summary ────────────────────────────────────────────────────
      if (resume.summary || resume.aiSummary) {
        drawSectionHeader("Professional Summary");
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        setColor(0);
        const lines = wrapText(resume.summary || resume.aiSummary, contW);
        checkPage(lines.length * lineH);
        doc.text(lines, mX, y);
        y += lines.length * lineH + sectionGap;
      }

      // ── Work Experience ────────────────────────────────────────────
      const expEntries = resume.experience.filter((e) => e.role);
      if (expEntries.length) {
        drawSectionHeader("Work Experience");

        for (const entry of expEntries) {
          checkPage(36);

          const roleStr    = sanitize(entry.role);
          const companyStr = entry.company ? sanitize(`, ${entry.company}`) : "";
          const dateStr    = [
            entry.startDate ? formatDate(entry.startDate) : "",
            entry.isCurrent ? "Present" : entry.endDate ? formatDate(entry.endDate) : "",
          ].filter(Boolean).join(" - ");

          // Date right-aligned in gray
          doc.setFont("times", "normal");
          doc.setFontSize(10);
          setColor(75);
          const dateClean = sanitize(dateStr);
          if (dateClean) doc.text(dateClean, pageW - mX, y, { align: "right" });

          // Role bold
          doc.setFont("times", "bold");
          setColor(0);
          const roleW = doc.getTextWidth(roleStr);
          doc.text(roleStr, mX, y);

          // Company normal immediately after role
          if (companyStr) {
            doc.setFont("times", "normal");
            doc.text(companyStr, mX + roleW, y);
          }

          y += lineH; // role row height (≈ text-sm leading-relaxed)

          // Bullets — mt-1 gap before first bullet
          const bullets = entry.aiBullets.length > 0
            ? entry.aiBullets
            : entry.rawBullets.filter((b) => b.trim());

          if (bullets.length) {
            y += 4; // mt-1

            doc.setFont("times", "normal");
            doc.setFontSize(10);
            setColor(0);

            const bulletIndent = 14;
            const bulletW = contW - bulletIndent - 2;

            for (const bullet of bullets) {
              const lines = wrapText(bullet, bulletW);
              checkPage(lines.length * bulletLineH);
              doc.text("•", mX + 2, y);
              doc.text(lines, mX + bulletIndent, y);
              y += lines.length * bulletLineH;
            }
          }

          y += sectionGap; // space-y-4 between entries
        }
      }

      // ── Skills ─────────────────────────────────────────────────────
      if (resume.skills.length) {
        drawSectionHeader("Skills");
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        setColor(0);
        const lines = wrapText(resume.skills.join(" · "), contW);
        checkPage(lines.length * lineH);
        doc.text(lines, mX, y);
        y += lines.length * lineH + sectionGap;
      }

      // ── Education ──────────────────────────────────────────────────
      const eduEntries = resume.education.filter((e) => e.degree || e.institution);
      if (eduEntries.length) {
        drawSectionHeader("Education");
        for (const entry of eduEntries) {
          checkPage(20);
          const degreeStr = sanitize(entry.degree || "");
          const instStr   = entry.institution ? sanitize(`, ${entry.institution}`) : "";
          const notesStr  = entry.notes ? sanitize(` — ${entry.notes}`) : ""; // em dash

          // Year right
          if (entry.year) {
            doc.setFont("times", "normal");
            doc.setFontSize(10);
            setColor(75);
            doc.text(sanitize(entry.year), pageW - mX, y, { align: "right" });
          }

          // Degree bold + institution normal
          doc.setFont("times", "bold");
          doc.setFontSize(10);
          setColor(0);
          const degW = doc.getTextWidth(degreeStr);
          doc.text(degreeStr, mX, y);

          doc.setFont("times", "normal");
          if (instStr) doc.text(instStr, mX + degW, y);

          // Notes in gray
          if (notesStr) {
            setColor(75);
            const instW = doc.getTextWidth(instStr);
            doc.text(notesStr, mX + degW + instW, y);
            setColor(0);
          }
          y += lineH + 6;
        }
      }

      const fileName = `${sanitize(resume.fullName || "resume").replace(/\s+/g, "-").toLowerCase()}-resume.pdf`;
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
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "9CA3AF" } },
        });

      const children: InstanceType<typeof Paragraph>[] = [];

      // Name
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({
          text: (resume.fullName || "Your Name").toUpperCase(),
          bold: true, size: 40, font: "Times New Roman", characterSpacing: 60,
        })],
      }));

      // Contact with hyperlinks
      type CItem = { label: string; url?: string };
      const cItems: (CItem | null)[] = [
        resume.email    ? { label: resume.email,    url: `mailto:${resume.email}` } : null,
        resume.phone    ? { label: resume.phone } : null,
        resume.location ? { label: resume.location } : null,
        resume.linkedIn ? { label: resume.linkedIn, url: resume.linkedIn.startsWith("http") ? resume.linkedIn : `https://${resume.linkedIn}` } : null,
        resume.portfolio? { label: resume.portfolio, url: resume.portfolio.startsWith("http") ? resume.portfolio : `https://${resume.portfolio}` } : null,
      ];
      const contacts = cItems.filter(Boolean) as CItem[];

      if (contacts.length) {
        const runs = contacts.flatMap((c, i) => {
          const sep = i < contacts.length - 1 ? [new TextRun({ text: " | ", size: 18, font: "Times New Roman", color: "374151" })] : [];
          if (c.url) {
            return [
              new ExternalHyperlink({ link: c.url, children: [
                new TextRun({ text: c.label, size: 18, font: "Times New Roman", color: "111111", underline: {} }),
              ]}),
              ...sep,
            ];
          }
          return [new TextRun({ text: c.label, size: 18, font: "Times New Roman", color: "374151" }), ...sep];
        });

        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          border: { bottom: { style: BorderStyle.THICK, size: 12, color: "000000" } },
          children: runs,
        }));
      }

      // Summary
      if (resume.summary || resume.aiSummary) {
        children.push(sectionHeading("Professional Summary"));
        children.push(new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: resume.summary || resume.aiSummary, size: 20, font: "Times New Roman" })],
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
              new TextRun({ text: entry.role, bold: true, size: 20, font: "Times New Roman" }),
              ...(entry.company ? [new TextRun({ text: `, ${entry.company}`, size: 20, font: "Times New Roman" })] : []),
              ...(dateStr ? [new TextRun({ text: `  ${dateStr}`, size: 20, font: "Times New Roman", color: "4B5563" })] : []),
            ],
          }));

          for (const b of getBullets(entry)) {
            children.push(new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 20 },
              children: [new TextRun({ text: b, size: 20, font: "Times New Roman" })],
            }));
          }
        }
      }

      // Skills
      if (resume.skills.length) {
        children.push(sectionHeading("Skills"));
        children.push(new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: resume.skills.join(" · "), size: 20, font: "Times New Roman" })],
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
              new TextRun({ text: entry.degree, bold: true, size: 20, font: "Times New Roman" }),
              ...(entry.institution ? [new TextRun({ text: `, ${entry.institution}`, size: 20, font: "Times New Roman" })] : []),
              ...(entry.notes ? [new TextRun({ text: ` — ${entry.notes}`, size: 20, font: "Times New Roman", color: "4B5563" })] : []),
              ...(entry.year ? [new TextRun({ text: `  ${entry.year}`, size: 20, font: "Times New Roman", color: "4B5563" })] : []),
            ],
          }));
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
