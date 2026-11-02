import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { loadCatalog, useCatalog } from "@/lib/catalog";

export function CatalogGate({ children }: { children: ReactNode }) {
  const { status, error } = useCatalog();

  useEffect(() => {
    void loadCatalog();
  }, []);

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-serif text-3xl">The catalogue couldn't be loaded.</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => void loadCatalog()}>Try again</Button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p role="status" className="text-muted-foreground">
          Loading the catalogue…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
