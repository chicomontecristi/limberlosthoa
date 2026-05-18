"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      // Supabase auto-detects the code in the URL fragment when detectSessionInUrl=true
      const { data, error: err } = await sb.auth.getSession();
      if (err) {
        setError(err.message);
        return;
      }
      // Give the SDK a tick to finish exchanging the code, then route.
      setTimeout(() => {
        window.location.replace("/portal/documents/");
      }, 200);
    })();
  }, []);

  return (
    <main className="max-w-xl mx-auto px-6 py-24 text-center">
      <h1 className="text-3xl mb-4">Signing you in…</h1>
      {error ? (
        <p className="text-danger text-lg" role="alert">
          {error}{" "}
          <a href="/login/" className="text-primary underline font-semibold">
            Try again
          </a>
        </p>
      ) : (
        <p className="text-lg">One moment.</p>
      )}
    </main>
  );
}
