import type { RequestHandler } from "express";

interface DuckDuckGoResult {
  AbstractText?: string;
  Answer?: string;
  Definition?: string;
  RelatedTopics?: Array<{ Text?: string } | { Name?: string; Topics?: Array<{ Text?: string }> }>;
}

function extractBestAnswer(data: DuckDuckGoResult): string | null {
  const candidates: string[] = [];
  const a = (s?: string) => (s && s.trim().length > 0 ? s.trim() : "");

  candidates.push(a(data.Answer));
  candidates.push(a(data.AbstractText));
  candidates.push(a(data.Definition));

  // Try related topics
  if (Array.isArray(data.RelatedTopics)) {
    for (const t of data.RelatedTopics) {
      if (t && typeof t === "object") {
        // @ts-expect-error - union shape
        if (t.Text) candidates.push(a(t.Text));
        // @ts-expect-error - union shape
        if (Array.isArray(t.Topics)) {
          // @ts-expect-error - union shape
          for (const sub of t.Topics) if (sub?.Text) candidates.push(a(sub.Text));
        }
      }
    }
  }

  const best = candidates.find((s) => s && s.length > 0);
  return best || null;
}

export const handleAsk: RequestHandler = async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) {
      res.status(400).json({ error: "Missing query 'q'" });
      return;
    }

    const url = new URL("https://api.duckduckgo.com/");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("no_html", "1");
    url.searchParams.set("skip_disambig", "1");
    url.searchParams.set("no_redirect", "1");

    const r = await fetch(url.toString());
    if (!r.ok) throw new Error(`DuckDuckGo API error: ${r.status}`);
    const data = (await r.json()) as DuckDuckGoResult;

    const answer = extractBestAnswer(data);

    res.json({
      ok: true,
      answer: answer,
      source: "duckduckgo",
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
};
