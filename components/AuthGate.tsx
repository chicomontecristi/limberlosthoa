"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

interface Props {
  requireAdmin?: boolean;
  children: React.ReactNode;
}

/**
 * Client-side auth gate for static-exported pages.
 * Redirects to /login if not signed in.
 * If requireAdmin, also checks owners.is_admin = true.
 */
export default function AuthGate({ requireAdmin = false, children }: Props) {
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        if (!cancelled) window.location.href = "/login/";
        return;
      }
      if (requireAdmin) {
        const { data } = await sb
          .from("owners")
          .select("is_admin")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (!data?.is_admin) {
          setState("denied");
          return;
        }
      }
      if (!cancelled) setState("ok");
    })();
    return () => { cancelled = true; };
  }, [requireAdmin]);

  if (state === "loading") {
    return (
      <main id="main" className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-xl text-ink">Loading…</p>
      </main>
    );
  }
  if (state === "denied") {
    return (
      <main id="main" className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl mb-4">Admins only</h1>
        <p className="text-lg">
          This page is for the Limberlost HOA administrator only.
        </p>
      </main>
    );
  }
  return <>{children}</>;
}
