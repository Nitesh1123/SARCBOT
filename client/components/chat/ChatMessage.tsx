import {
  Cpu,
  User,
  Copy as CopyIcon,
  Pencil,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
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

export default function ChatMessage({
  role,
  text,
  feedback = null,
  onCopy,
  onFeedback,
  onEdit,
}: Props) {
  const isHuman = role === "human";
  return (
    <div
      className={cn(
        "group relative flex w-full items-start gap-3 py-0.5 msg-enter",
        isHuman ? "justify-end" : "justify-start",
      )}
    >
      {!isHuman && (
        <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.35)]">
          <Cpu className="h-5 w-5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed relative message-content",
          isHuman ? "message-content-user" : "message-content-ai",
        )}
      >
        {text}
        <div
          className={cn(
            "pointer-events-none absolute -top-2 right-2 opacity-0 translate-y-1 transition-all duration-150",
            "group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-1",
          )}
          aria-hidden="true"
        >
          {!isHuman ? (
            <>
              <button
                className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70 hover:bg-secondary/50"
                onClick={() => onFeedback?.("up")}
                aria-label="Thumbs up"
                title="Thumbs up"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70 hover:bg-secondary/50"
                onClick={() => onFeedback?.("down")}
                aria-label="Thumbs down"
                title="Thumbs down"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
              <button
                className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70 hover:bg-secondary/50"
                onClick={() => onCopy?.(text)}
                aria-label="Copy message"
                title="Copy"
              >
                <CopyIcon className="h-3.5 w-3.5" />
              </button>
              {feedback && (
                <span className="pointer-events-none ml-1 text-[10px] text-muted-foreground">
                  ({feedback})
                </span>
              )}
            </>
          ) : (
            <>
              <button
                className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70 hover:bg-secondary/50"
                onClick={() => onCopy?.(text)}
                aria-label="Copy message"
                title="Copy"
              >
                <CopyIcon className="h-3.5 w-3.5" />
              </button>
              <button
                className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70 hover:bg-secondary/50"
                onClick={onEdit}
                aria-label="Edit message"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </>
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
