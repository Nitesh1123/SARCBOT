import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-3.5rem-3.5rem)] flex items-center justify-center">
      <div className="text-center rounded-xl border border-border/60 p-8 bg-card/60 backdrop-blur">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Wrong timeline, human. That page doesn’t exist.
        </p>
        <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
