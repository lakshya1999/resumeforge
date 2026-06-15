import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildResumeParsePrompt } from "@/lib/prompts";

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText?.trim() || resumeText.trim().length < 40) {
      return NextResponse.json(
        { error: "Couldn't read enough text from this file. If it's a scanned/image PDF, try a text-based export." },
        { status: 400 }
      );
    }

    // Cap input so a huge paste can't blow the context window
    const prompt = buildResumeParsePrompt(resumeText.slice(0, 12000));

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("parse-resume error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
