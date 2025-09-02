import { Cpu, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatRole = "human" | "unit";

interface Props {
  role: ChatRole;
  text: string;
  feedback?: "up" | "down" | null;
  onCopy?: (text: string) => void;
  onFeedback?: (v: "up" | "down") => void;
  onEdit?: () => void;
}

export default function ChatMessage({ role, text, feedback = null, onCopy, onFeedback, onEdit }: Props) {
  const isHuman = role === "human";
  return (
    <div className={cn("group relative flex w-full items-start gap-3 py-0.5", isHuman ? "justify-end" : "justify-start")}>
      {!isHuman && (
        <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.35)]">
          <Cpu className="h-5 w-5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed relative",
          isHuman
            ? "bg-primary text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
            : "bg-secondary/40 text-foreground border border-border/60",
        )}
      >
        {text}
      </div>
      {!isHuman ? (
        <div className="text-[11px] mt-1 flex items-center gap-2 text-muted-foreground">
          <button
            className="inline-flex h-6 items-center rounded-md bg-background/70 px-2 border border-border/60"
            onClick={() => onFeedback?.("up")}
            aria-label="Thumbs up"
          >
            👍
          </button>
          <button
            className="inline-flex h-6 items-center rounded-md bg-background/70 px-2 border border-border/60"
            onClick={() => onFeedback?.("down")}
            aria-label="Thumbs down"
          >
            👎
          </button>
          <button
            className="ml-2 underline-offset-4 hover:underline"
            onClick={() => onCopy?.(text)}
            aria-label="Copy message"
          >
            Copy
          </button>
          {feedback && <span className="ml-1">({feedback})</span>}
        </div>
      ) : (
        <div className="text-[11px] mt-1 flex items-center gap-2 text-muted-foreground">
          <button className="underline-offset-4 hover:underline" onClick={() => onCopy?.(text)} aria-label="Copy message">Copy</button>
          <button className="underline-offset-4 hover:underline" onClick={onEdit} aria-label="Edit message">Edit</button>
        </div>
      )}
      {isHuman && (
        <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/30 text-accent-foreground border border-border/60">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
