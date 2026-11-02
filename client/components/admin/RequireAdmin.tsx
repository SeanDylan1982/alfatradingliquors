import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAccess } from "@/lib/auth";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const access = useAdminAccess();

  if (access.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p role="status" className="text-muted-foreground">
          Checking your access…
        </p>
      </div>
    );
  }

  if (access.status === "signed-out" || access.status === "not-admin") {
    return <Navigate to="/admin/login" replace />;
  }

  if (access.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          We couldn't check your admin access: {access.message}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
