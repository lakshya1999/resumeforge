import Groq from "groq-sdk";

// Single source of truth for the model + client.
// Swap GROQ_MODEL here to change every AI route at once.
export const GROQ_MODEL = "openai/gpt-oss-120b";

// Lazy factory — never instantiate at module load, or a missing key
// crashes the Next.js build during page-data collection.
export const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });
