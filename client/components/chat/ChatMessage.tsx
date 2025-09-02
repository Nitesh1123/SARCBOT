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
    <div className={cn("group relative flex gap-3", isHuman ? "justify-end" : "justify-start")}>
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
        <div className={cn("absolute -top-3", isHuman ? "left-2" : "right-2")}></div>
        <div className={cn("absolute -top-8 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100", isHuman ? "right-0" : "left-0")}>
          {!isHuman && (
            <>
              <button
                className="inline-flex h-7 items-center rounded-md bg-background/70 px-2 text-xs border border-border/60"
                onClick={() => onFeedback?.("up")}
                aria-label="Thumbs up"
              >
                👍{feedback === "up" ? "" : ""}
              </button>
              <button
                className="inline-flex h-7 items-center rounded-md bg-background/70 px-2 text-xs border border-border/60"
                onClick={() => onFeedback?.("down")}
                aria-label="Thumbs down"
              >
                👎
              </button>
            </>
          )}
          <button
            className="inline-flex h-7 items-center rounded-md bg-background/70 px-2 text-xs border border-border/60"
            onClick={() => onCopy?.(text)}
            aria-label="Copy message"
          >
            Copy
          </button>
          {isHuman && (
            <button
              className="inline-flex h-7 items-center rounded-md bg-background/70 px-2 text-xs border border-border/60"
              onClick={onEdit}
              aria-label="Edit message"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      {isHuman && (
        <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/30 text-accent-foreground border border-border/60">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
