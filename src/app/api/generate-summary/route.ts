import { NextRequest, NextResponse } from "next/server";
import { buildSummaryPrompt } from "@/lib/prompts";
import { ResumeVariant } from "@/types/resume";
import { getGroq, GROQ_MODEL } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { name, experience, skills, variant } = await req.json();

    const prompt = buildSummaryPrompt(
      name || "the candidate",
      experience || [],
      skills || [],
      (variant as ResumeVariant) || "startup"
    );

    const completion = await getGroq().chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ summary: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-summary error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
