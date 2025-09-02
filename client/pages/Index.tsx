import { useEffect, useRef, useState } from "react";
import { AskResponse } from "@shared/api";
import ChatMessage, { ChatRole } from "@/components/chat/ChatMessage";
import { ArrowUp, Sparkles } from "lucide-react";

interface Msg { role: ChatRole; text: string }


export default function Index() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "unit", text: "I am Unit 734. Ask a question, human. Keep it short; my patience is shorter." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const ask = async (q: string) => {
    setLoading(true);
    try {
      const url = `/api/ask?q=${encodeURIComponent(q)}`;
      const r = await fetch(url);
      const data = (await r.json()) as AskResponse;
      const answer = (data.answer ?? "").trim();
      const reply = answer || "No useful output, human. Try being clearer.";
      setMessages((m) => [...m, { role: "unit", text: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "unit", text: "Your request crashed something. Not me, obviously." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "human", text: q }]);
    setInput("");
    await ask(q);
  };

  return (
    <main className="relative min-h-[calc(100vh-3.5rem-3.5rem)]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.12),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(0deg,transparent_24%,hsl(var(--border))_25%,hsl(var(--border))_26%,transparent_27%,transparent_74%,hsl(var(--border))_75%,hsl(var(--border))_76%,transparent_77%),linear-gradient(90deg,transparent_24%,hsl(var(--border))_25%,hsl(var(--border))_26%,transparent_27%,transparent_74%,hsl(var(--border))_75%,hsl(var(--border))_76%,transparent_77%)] bg-[length:40px_40px]"/>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur shadow-[0_0_60px_hsl(var(--primary)/0.25)]">
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Unit 734 • sarcastic mode engaged</span>
              </div>
            </div>
            <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} text={m.text} />
              ))}
            </div>
            <form onSubmit={onSubmit} className="p-4 border-t border-border/60">
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={loading ? "Processing…" : "Ask anything, human"}
                  className="w-full rounded-md border bg-background/80 px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  aria-label="Your question"
                />
                <button
                  type="submit"
                  disabled={loading || input.trim().length === 0}
                  className="absolute right-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-60"
                  aria-label="Send"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur">
            <h2 className="text-sm font-semibold mb-2">How to use</h2>
            <ul className="text-xs text-muted-foreground list-disc ml-4 space-y-1">
              <li>Ask a clear, specific question.</li>
              <li>Get a short, correct answer with a dash of sarcasm.</li>
              <li>Addressed to you as “human,” obviously.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur">
            <h2 className="text-sm font-semibold mb-2">Tone</h2>
            <p className="text-xs text-muted-foreground">
              Dry, witty, slightly annoyed. Helpful despite the attitude.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
