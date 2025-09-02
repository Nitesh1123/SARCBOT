export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-10">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground flex items-center justify-between">
        <p>
          © {new Date().getFullYear()} Unit 734. Yes, human, I know what year it is.
        </p>
        <p>Built with sarcasm and 0% patience.</p>
      </div>
    </footer>
  );
}
