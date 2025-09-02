import { Cpu, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatRole = "human" | "unit";

export default function ChatMessage({ role, text }: { role: ChatRole; text: string }) {
  const isHuman = role === "human";
  return (
    <div className={cn("flex gap-3", isHuman ? "justify-end" : "justify-start")}>      
      {!isHuman && (
        <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.35)]">
          <Cpu className="h-5 w-5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed",
          isHuman
            ? "bg-primary text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
            : "bg-secondary/40 text-foreground border border-border/60",
        )}
      >
        {text}
      </div>
      {isHuman && (
        <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/30 text-accent-foreground border border-border/60">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
