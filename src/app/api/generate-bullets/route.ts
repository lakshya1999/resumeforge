import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildBulletPrompt } from "@/lib/prompts";
import { ResumeVariant } from "@/types/resume";

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { rawBullets, role, company, metrics, projectType, variant, mode } = await req.json();

    if (!rawBullets?.length || !role) {
      return NextResponse.json({ error: "rawBullets and role are required" }, { status: 400 });
    }

    const prompt = buildBulletPrompt(
      rawBullets,
      role,
      company || "",
      metrics || "",
      projectType || "other",
      (variant as ResumeVariant) || "startup",
      (mode as "single" | "multiple") || "multiple"
    );

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-bullets error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
