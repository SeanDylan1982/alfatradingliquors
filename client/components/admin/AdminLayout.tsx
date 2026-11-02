import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowLeft, LogOut, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showError } from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products", end: false },
  { to: "/admin/categories", label: "Categories", end: false },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              to="/admin"
              className="flex shrink-0 items-center gap-2 font-serif text-lg font-semibold"
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary text-gold">
                <Wine className="size-4" aria-hidden="true" />
              </span>
              Alfa Admin
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto text-sm">
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "shrink-0 rounded-md px-3 py-2 font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft />
                View store
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) showError(error);
              }}
            >
              <LogOut />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
