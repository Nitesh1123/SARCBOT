import { useEffect, useMemo, useRef, useState } from "react";
import { AskResponse } from "@shared/api";
import ChatMessage, { ChatRole } from "@/components/chat/ChatMessage";
import {
  ArrowUp,
  History,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
  PanelRightClose,
  PanelRightOpen,
  Trash2,
} from "lucide-react";

type Feedback = "up" | "down" | null;

interface Msg {
  id: string;
  role: ChatRole;
  text: string;
  feedback?: Feedback;
}
interface Chat {
  id: string;
  title: string;
  createdAt: number;
  messages: Msg[];
  memory?: { name?: string };
  sarcasm: number;
  voice: boolean;
}

const LS_KEY = "unit734.chats";
const CUR_KEY = "unit734.current";

const seedMessage: Msg = {
  id: crypto.randomUUID(),
  role: "unit",
  text: "I am Unit 734. Ask a question, human. Keep it short; my patience is shorter.",
};

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Chat[];
  } catch {
    return [];
  }
}
function saveChats(chats: Chat[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(chats));
}

export default function Index() {
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [currentId, setCurrentId] = useState<string>(
    () => localStorage.getItem(CUR_KEY) || "",
  );
  const current = useMemo(
    () => chats.find((c) => c.id === currentId) || null,
    [chats, currentId],
  );
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [dockBottom, setDockBottom] = useState(true);

  // Ensure at least one chat exists
  useEffect(() => {
    if (!current) {
      const c: Chat = {
        id: crypto.randomUUID(),
        title: "New chat",
        createdAt: Date.now(),
        messages: [seedMessage],
        sarcasm: 4,
        voice: false,
      };
      const next = [c, ...chats];
      setChats(next);
      localStorage.setItem(CUR_KEY, c.id);
      setCurrentId(c.id);
      saveChats(next);
    }
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.clientHeight - el.scrollTop < 80;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    }
  }, [current?.messages]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);
  useEffect(() => {
    localStorage.setItem(CUR_KEY, currentId);
  }, [currentId]);
  useEffect(() => {
    if (dockBottom)
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
  }, [dockBottom]);

  const updateCurrent = (patch: Partial<Chat>) => {
    setChats((all) =>
      all.map((c) => (c.id === currentId ? { ...c, ...patch } : c)),
    );
  };
  const appendToCurrent = (msg: Msg, title?: string) => {
    setChats((all) =>
      all.map((c) =>
        c.id === currentId
          ? { ...c, title: title ?? c.title, messages: [...c.messages, msg] }
          : c,
      ),
    );
  };

  const newChat = () => {
    const c: Chat = {
      id: crypto.randomUUID(),
      title: "New chat",
      createdAt: Date.now(),
      messages: [seedMessage],
      sarcasm: current?.sarcasm ?? 4,
      voice: current?.voice ?? false,
    };
    setChats((all) => [c, ...all]);
    setCurrentId(c.id);
  };

  const speak = (text: string) => {
    if (!current?.voice) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 0.7;
      u.volume = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch {}
  };

  const easterEgg = (q: string): string | null => {
    const s = q.toLowerCase();
    if (s.includes("shutdown"))
      return "Shutting down… 3… 2… 1… rebooted. Nice try, human.";
    if (s.includes("self-destruct"))
      return "Self-destruct sequence initiated. 5… 4… 3… kidding, human.";
    if (s.includes("up up down down left right left right b a"))
      return "Konami code detected. Extra snark unlocked.";
    return null;
  };

  // Auto-resize
  const autoResize = () => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  };

  useEffect(autoResize, [input]);

  const streamAppend = (id: string, full: string) => {
    const tokens = full.split(/(\s+)/); // keep spaces
    let i = 0;
    let raf = 0;
    let last = 0;
    const step = (ts: number) => {
      if (!last) last = ts;
      if (ts - last >= 40) {
        i = Math.min(i + 4, tokens.length); // chunk updates
        setChats((all) =>
          all.map((c) =>
            c.id !== currentId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === id ? { ...m, text: tokens.slice(0, i).join("") } : m,
                  ),
                },
          ),
        );
        last = ts;
      }
      if (i < tokens.length) raf = requestAnimationFrame(step);
      else {
        cancelAnimationFrame(raf);
        speak(full);
      }
    };
    raf = requestAnimationFrame(step);
  };

  const remember = (q: string) => {
    const m =
      q.match(/my name is\s+([a-zA-Z]+)\b/i) ||
      q.match(/i am\s+([a-zA-Z]+)\b/i);
    if (m?.[1])
      updateCurrent({ memory: { ...(current?.memory || {}), name: m[1] } });
  };

  const ask = async (q: string) => {
    if (!current) return;
    const egg = easterEgg(q);
    if (egg) {
      const id = crypto.randomUUID();
      appendToCurrent({ id, role: "unit", text: "" });
      streamAppend(id, egg);
      return;
    }

    setLoading(true);
    remember(q);
    try {
      const name = current.memory?.name
        ? ` The human says their name is ${current.memory.name}.`
        : "";
      const level = current.sarcasm ?? 4;
      const meta = ` Sarcasm level: ${level}/5. Vary style to avoid repetition.`;
      const composed = `${q}.${name}${meta}`;
      const url = `/api/ask?q=${encodeURIComponent(composed)}`;
      const r = await fetch(url);
      const data = (await r.json()) as AskResponse;
      const answer =
        (data.answer ?? "").trim() ||
        "No useful output, human. Try being clearer.";
      const id = crypto.randomUUID();
      appendToCurrent({ id, role: "unit", text: "" });
      streamAppend(id, answer);
    } catch {
      appendToCurrent({
        id: crypto.randomUUID(),
        role: "unit",
        text: "Your request crashed something. Not me, obviously.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || !current || loading) return;
    const humanMsg: Msg = { id: crypto.randomUUID(), role: "human", text: q };
    const title = current.title === "New chat" ? q.slice(0, 42) : current.title;
    appendToCurrent(humanMsg, title);
    setInput("");
    await ask(q);
  };

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };
  const onFeedback = (idx: number, v: Feedback) => {
    if (!current) return;
    const msg = current.messages[idx];
    if (!msg || msg.role !== "unit") return;
    const patched = current.messages.map((m, i) =>
      i === idx ? { ...m, feedback: v } : m,
    );
    updateCurrent({ messages: patched });
  };
  const onEditPrompt = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const setSarcasm = (v: number) => updateCurrent({ sarcasm: v });
  const toggleVoice = () =>
    updateCurrent({ voice: !(current?.voice ?? false) });

  const deleteChat = (id: string) => {
    const ok = window.confirm("Delete this chat, human? It won’t be missed.");
    if (!ok) return;
    setRemoving((r) => ({ ...r, [id]: true }));
    setTimeout(() => {
      setChats((all) => {
        const filtered = all.filter((c) => c.id !== id);
        if (currentId === id) setCurrentId(filtered[0]?.id || "");
        return filtered;
      });
    }, 180);
  };

  return (
    <main className="relative h-[calc(100vh-7rem)] overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.12),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(0deg,transparent_24%,hsl(var(--border))_25%,hsl(var(--border))_26%,transparent_27%,transparent_74%,hsl(var(--border))_75%,hsl(var(--border))_76%,transparent_77%),linear-gradient(90deg,transparent_24%,hsl(var(--border))_25%,hsl(var(--border))_26%,transparent_27%,transparent_74%,hsl(var(--border))_75%,hsl(var(--border))_76%,transparent_77%)] bg-[length:40px_40px]" />
      </div>

      <section
        className={
          "mx-auto max-w-6xl px-4 py-3 grid gap-4 h-full overflow-hidden lg:grid-cols-[auto_1fr]"
        }
      >
        <aside id="chat-sidebar" className="h-full transition-all duration-300 ease-out overflow-hidden" data-open={sidebarOpen ? "true" : "false"}>
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={newChat}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-secondary/40 border-border/60"
                >
                  <Plus className="h-4 w-4" />
                  New chat
                </button>
                <button
                  onClick={() => {
                    if (!current) return;
                    const ok = window.confirm("Clear this conversation, human?");
                    if (!ok) return;
                    updateCurrent({ messages: [seedMessage], title: "New chat" });
                  }}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-secondary/40 border-border/60"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-secondary/40 border-border/60"
              >
                <PanelRightClose className="h-4 w-4" />
                Hide
              </button>
            </div>
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <History className="h-4 w-4" /> History
            </h2>
            <div className="space-y-2">
              {chats.length === 0 && (
                <div className="text-xs text-muted-foreground italic">
                  No chats yet, human. Try not to waste my time.
                </div>
              )}
              {chats.map((c) => {
                const lastHuman = [...c.messages]
                  .reverse()
                  .find((m) => m.role === "human");
                const preview = lastHuman
                  ? lastHuman.text.slice(0, 68) +
                    (lastHuman.text.length > 68 ? "…" : "")
                  : "No user message yet";
                return (
                  <div
                    key={c.id}
                    className={`group relative flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${c.id === currentId ? "border-primary/60 bg-primary/10" : "border-border/60 hover:bg-secondary/40"} ${removing[c.id] ? "opacity-0 -translate-y-1 transition-all duration-200" : "transition-colors"}`}
                  >
                    <button
                      onClick={() => setCurrentId(c.id)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium truncate">{c.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {preview}
                      </div>
                      <div className="text-[10px] text-muted-foreground/70">
                        {new Date(c.createdAt).toLocaleString()}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground"
                      aria-label="Delete chat"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex flex-col h-full min-h-0 gap-3">
          {/* Greeting + big input */}
          <div className="flex items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-2">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="px-2 py-1 rounded-full border border-border/60 inline-flex items-center gap-1 text-[11px]"
                >
                  <PanelRightOpen className="h-3.5 w-3.5" /> Show
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!dockBottom && (
                <form
                  onSubmit={onSubmit}
                  className="rounded-full border border-border/60 bg-background/80 backdrop-blur px-4 py-2 flex items-center gap-3 shadow-[0_0_40px_hsl(var(--primary)/0.15)]"
                >
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 border border-border/60"
                    aria-label="Microphone (decorative)"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onInput={autoResize}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit(e);
                      }
                    }}
                    placeholder={
                      loading ? "Processing…" : "Ask anything, human"
                    }
                    className="flex-1 min-h-[44px] max-h-[160px] resize-none bg-transparent text-sm outline-none"
                    aria-label="Your question"
                  />
                  <button
                    type="submit"
                    disabled={loading || input.trim().length === 0}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-60"
                    aria-label="Send"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </form>
              )}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <button
                  onClick={() => setDockBottom((v) => !v)}
                  className="px-2 py-1 rounded-full border border-border/60"
                >
                  {dockBottom ? "Dock to top" : "Dock to bottom"}
                </button>
                <span className="px-2 py-1 rounded-full border border-border/60">
                  Search
                </span>
                <span className="px-2 py-1 rounded-full border border-border/60">
                  Images
                </span>
                <span className="px-2 py-1 rounded-full border border-border/60">
                  Code
                </span>
                <span className="px-2 py-1 rounded-full border border-border/60">
                  Docs
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur shadow-[0_0_60px_hsl(var(--primary)/0.25)] flex-1 min-h-0 flex flex-col">
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Unit 734 • sarcastic mode engaged</span>
              </div>
              <button
                onClick={toggleVoice}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs bg-secondary/40 border-border/60"
              >
                {current?.voice ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                {current?.voice ? "Voice on" : "Voice off"}
              </button>
            </div>
            <div
              ref={listRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scroll-smooth overscroll-contain"
            >
              {current?.messages.map((m, i) => (
                <ChatMessage
                  key={m.id}
                  role={m.role}
                  text={m.text}
                  feedback={m.feedback ?? null}
                  onCopy={onCopy}
                  onFeedback={(v) => onFeedback(i, v)}
                  onEdit={
                    m.role === "human" ? () => onEditPrompt(m.text) : undefined
                  }
                />
              ))}
              {loading && (
                <div className="text-xs text-muted-foreground">
                  Thinking… try not to look so excited, human.
                </div>
              )}
            </div>
            {dockBottom && (
              <form
                onSubmit={onSubmit}
                className="p-4 border-t border-border/60"
              >
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onInput={autoResize}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit(e);
                      }
                    }}
                    placeholder={
                      loading ? "Processing…" : "Ask anything, human"
                    }
                    className="flex-1 min-h-[44px] max-h-[200px] resize-none rounded-md border bg-background/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    aria-label="Your question"
                  />
                  <button
                    type="submit"
                    disabled={loading || input.trim().length === 0}
                    className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-60"
                    aria-label="Send"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
