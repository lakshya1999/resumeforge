import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildJDParserPrompt } from "@/lib/prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { jdText, resumeSkills } = await req.json();

    if (!jdText?.trim()) {
      return NextResponse.json({ error: "jdText is required" }, { status: 400 });
    }

    const prompt = buildJDParserPrompt(jdText, resumeSkills || []);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("parse-jd error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
