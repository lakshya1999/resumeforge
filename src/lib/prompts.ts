import { ResumeVariant } from "@/types/resume";

export function buildBulletPrompt(
  rawBullets: string[],
  role: string,
  company: string,
  metrics: string,
  projectType: string,
  variant: ResumeVariant,
  mode: "single" | "multiple" = "multiple"
): string {
  const variantInstructions = {
    startup: `
- Emphasize ownership, 0→1 work, ambiguity navigation, and speed of execution
- Use phrases like "led end-to-end", "defined from scratch", "owned product strategy"
- Show cross-functional leadership and founder mindset`,
    bigtech: `
- Emphasize scale, systems thinking, experimentation, and measurable impact on large user bases
- Use phrases like "drove alignment across", "improved at scale", "ran A/B experiments"
- Highlight metrics in terms of MAU, revenue impact, or % improvements on millions of users`,
    international: `
- Use clean, formal ATS-safe language with no idioms
- Be explicit about scope, timeline, and measurable outcomes
- Avoid ambiguity — every bullet must be self-contained and clear to a non-native reader`,
  };

  return `You are an expert resume writer specializing in Product Design careers. Your job is to rewrite raw resume bullet points into high-impact, ATS-optimized bullets.

CONTEXT:
- Role: ${role} at ${company}
- Project type: ${projectType}
- Key metrics the candidate wants to highlight: ${metrics || "not specified"}
- Resume variant: ${variant}

VARIANT-SPECIFIC RULES:
${variantInstructions[variant]}

UNIVERSAL RULES (non-negotiable):
1. Every bullet MUST follow this structure: [Action Verb] + [What you did] + [Impact/Result] + [Metric if available]
2. Start with a strong, specific past-tense action verb (Redesigned, Led, Defined, Built, Launched, Improved, Reduced, Drove, Architected, Shipped)
3. NEVER use weak verbs: worked on, helped, assisted, involved in, responsible for
4. Include at least one specific metric in every bullet (%, $, time saved, users impacted). If none provided, estimate plausibly based on context (mark with "~" prefix)
5. Inject relevant ATS keywords naturally: UX Research, User Testing, A/B Testing, Design Systems, Cross-functional Collaboration, Figma, Product Strategy, Conversion Rate Optimization, Information Architecture
6. Maximum 2 lines per bullet. No fluff.
7. Product design is PRODUCT work — show business impact, not just visual output

OUTPUT MODE: ${mode === "single" ? "SINGLE BULLET" : "MULTIPLE BULLETS"}
${mode === "single"
  ? `- Combine ALL the raw input into exactly ONE powerful, comprehensive bullet point
- It may be slightly longer (up to 3 lines) to capture the full impact
- Do NOT split into multiple bullets under any circumstances
- The "bullets" array must contain exactly 1 item`
  : `- Rewrite each raw input as its own separate bullet (1-in, 1-out)
- If a single raw input contains multiple distinct achievements, you may split it into 2 bullets
- Each bullet stands alone`
}

RAW INPUT:
${rawBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

OUTPUT FORMAT:
Return a JSON object with this exact shape:
{
  "bullets": ["rewritten bullet 1", "rewritten bullet 2", ...],
  "keywords": ["keyword1", "keyword2", ...] // ATS keywords injected
}

Return ONLY the JSON. No explanation, no markdown fences.`;
}

export function buildJDParserPrompt(jdText: string, resumeSkills: string[]): string {
  return `You are an ATS optimization expert. Analyze this job description and extract actionable intelligence for a Product Designer candidate.

JOB DESCRIPTION:
${jdText}

CANDIDATE'S CURRENT SKILLS:
${resumeSkills.join(", ")}

YOUR TASK:
1. Extract ALL keywords that ATS systems will scan for (tools, skills, methodologies, soft skills, domain terms)
2. Identify which keywords the candidate already has (matched)
3. Identify critical missing keywords the candidate should add
4. Generate specific, actionable suggestions to improve the resume for this JD

OUTPUT FORMAT — return ONLY this JSON:
{
  "keywords": ["all keywords from JD"],
  "matchedKeywords": ["keywords candidate has"],
  "missingKeywords": ["important keywords candidate lacks"],
  "suggestions": [
    "Specific suggestion 1 (e.g., 'Add a bullet about A/B testing methodology in your Classplus role')",
    "Specific suggestion 2",
    "Specific suggestion 3",
    "Specific suggestion 4",
    "Specific suggestion 5"
  ],
  "atsScore": 72 // 0-100, how well current resume matches JD
}

Be ruthlessly specific in suggestions — no generic advice.`;
}

export function buildSummaryPrompt(
  name: string,
  experience: Array<{ role: string; company: string }>,
  skills: string[],
  variant: ResumeVariant
): string {
  const variantTone = {
    startup: "entrepreneurial, ownership-driven, impact-first",
    bigtech: "systems-focused, data-driven, scale-oriented",
    international: "professional, precise, globally clear",
  };

  return `Write a 3-sentence professional summary for a Product Designer resume.

CANDIDATE: ${name}
EXPERIENCE: ${experience.map((e) => `${e.role} at ${e.company}`).join(", ")}
SKILLS: ${skills.join(", ")}
TONE: ${variantTone[variant]}

RULES:
- Sentence 1: Who they are (years of experience, specialization)
- Sentence 2: Core impact and approach (metrics, domains)
- Sentence 3: What they bring to the next role (value proposition)
- NO clichés: "passionate", "team player", "detail-oriented", "self-starter"
- Include 3-4 ATS keywords naturally
- Maximum 60 words total

Return ONLY the summary text. No labels, no JSON.`;
}

export function buildATSScorePrompt(resumeText: string, jdText: string): string {
  return `Score how well this resume matches the job description for ATS compatibility.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Evaluate on:
1. Keyword match rate (40%)
2. Impact metrics presence (25%)
3. Role alignment (20%)
4. Formatting signals (15%)

Return ONLY this JSON:
{
  "score": 78,
  "breakdown": {
    "keywordMatch": 35,
    "metricsPresence": 20,
    "roleAlignment": 15,
    "formatting": 8
  },
  "topIssues": ["Issue 1", "Issue 2", "Issue 3"]
}`;
}
