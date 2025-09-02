import { Cpu, Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/20 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.45)]">
            <Cpu className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Unit 734</div>
            <div className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
              Sarcastic intelligence from the future
            </div>
          </div>
        </a>
        <button
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm",
            "bg-secondary/40 hover:bg-secondary/60 border-border/60",
          )}
          onClick={() => setDark((v) => !v)}
          aria-label="Toggle theme"
        >
          {dark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="hidden sm:inline">{dark ? "Light" : "Dark"} mode</span>
        </button>
      </div>
    </header>
  );
}
