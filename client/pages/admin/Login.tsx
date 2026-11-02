import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAccess } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const access = useAdminAccess();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (access.status === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSigningIn(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsSigningIn(false);
    if (signInError) setError(signInError.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-gold">
            <Wine className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-serif text-3xl">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Alfa Trading Liquors
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {access.status === "not-admin" && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              This account doesn't have admin access.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSigningIn}
          >
            {isSigningIn ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
