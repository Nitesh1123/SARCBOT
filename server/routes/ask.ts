import type { RequestHandler } from "express";

const MODEL = "models/gemini-1.5-flash-latest";

interface GeminiCandidatePart { text?: string }
interface GeminiCandidateContent { parts?: GeminiCandidatePart[]; role?: string }
interface GeminiResponse { candidates?: Array<{ content?: GeminiCandidateContent }>; promptFeedback?: unknown }

function extractText(resp: GeminiResponse): string | null {
  const c = resp.candidates?.[0];
  const parts = c?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join(" ").trim();
  return text || null;
}

export const handleAsk: RequestHandler = async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) return void res.status(400).json({ ok: false, error: "Missing query 'q'" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return void res.status(500).json({ ok: false, error: "GEMINI_API_KEY not set on server" });

    const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${apiKey}`;

    const system =
      "You are Unit 734, a hyper-intelligent, slightly annoyed robot from the future. " +
      "Always address the user as 'human'. Answer correctly, briefly, with dry, witty sarcasm. " +
      "Keep replies under 80 words. No markdown headings. No preambles.";

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${system}\n\nQuestion: ${q}` }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 200,
      },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!r.ok) throw new Error(`Gemini API error: ${r.status}`);
    const data = (await r.json()) as GeminiResponse;

    const text = extractText(data);
    res.json({ ok: true, answer: text, source: "gemini" });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
};
