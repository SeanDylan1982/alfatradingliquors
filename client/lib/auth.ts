import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { refreshCatalog } from "./catalog";
import { describeError } from "./errors";
import { supabase } from "./supabase";

export type AdminAccess =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-admin" }
  | { status: "admin"; email: string }
  | { status: "error"; message: string };

export function useAdminAccess(): AdminAccess {
  const [access, setAccess] = useState<AdminAccess>({ status: "loading" });

  useEffect(() => {
    let active = true;

    const resolve = async (session: Session | null) => {
      if (!session) {
        setAccess({ status: "signed-out" });
        return;
      }
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (error) throw new Error(error.message);
        if (!active) return;
        if (!data) {
          setAccess({ status: "not-admin" });
          return;
        }
        setAccess({ status: "admin", email: session.user.email ?? "" });
        await refreshCatalog();
      } catch (error) {
        if (active)
          setAccess({ status: "error", message: describeError(error) });
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Deferred so Supabase's auth lock is released before the admin check queries the database.
        setTimeout(() => void resolve(session), 0);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return access;
}
