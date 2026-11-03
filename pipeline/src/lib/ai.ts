import { aiProvider, env } from "../config";
import { warn } from "./log";

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

function parseLooseJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export function aiEnabled(): boolean {
  return aiProvider !== "none";
}

export function aiLabel(): string {
  if (aiProvider === "gemini") return `gemini:${env.geminiModel}`;
  if (aiProvider === "groq") return `groq:${env.groqModel}`;
  if (aiProvider === "openrouter") return `openrouter:${env.openrouterModel}`;
  return "template fallback";
}

async function callGemini(prompt: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    env.geminiModel,
  )}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(45_000),
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    warn("ai", `Gemini responded ${response.status}`, (await response.text()).slice(0, 200));
    return null;
  }

  const data = (await response.json()) as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
  extraHeaders: Record<string, string> = {},
): Promise<string | null> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(45_000),
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior e-commerce copywriter and brand strategist for a South African trend store. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    warn("ai", `AI responded ${response.status}`, (await response.text()).slice(0, 200));
    return null;
  }

  const data = (await response.json()) as ChatResponse;
  return data.choices?.[0]?.message?.content ?? null;
}

export async function aiJson<T>(prompt: string): Promise<T | null> {
  let raw: string | null = null;

  try {
    if (aiProvider === "gemini") {
      raw = await callGemini(prompt);
    } else if (aiProvider === "groq") {
      raw = await callOpenAiCompatible(
        "https://api.groq.com/openai/v1",
        env.groqApiKey,
        env.groqModel,
        prompt,
      );
    } else if (aiProvider === "openrouter") {
      raw = await callOpenAiCompatible(
        "https://openrouter.ai/api/v1",
        env.openrouterApiKey,
        env.openrouterModel,
        prompt,
        {
          "http-referer": "https://pulsecart.pages.dev",
          "x-title": "PulseCart",
        },
      );
    }
  } catch (error) {
    warn("ai", "AI request failed", (error as Error).message);
    return null;
  }

  if (!raw) return null;
  const parsed = parseLooseJson<T>(raw);
  if (!parsed) warn("ai", "AI returned unparseable JSON");
  return parsed;
}
