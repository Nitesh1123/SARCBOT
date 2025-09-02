export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
        <p>© {new Date().getFullYear()} Unit 734.</p>
        <p>Built with sarcasm and 0% patience.</p>
      </div>
    </footer>
  );
}
