"use client";

import { useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { getSupabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const sb = getSupabase();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback/`
        : undefined;
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });
    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  return (
    <>
      <PublicHeader />
      <main id="main" className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-3xl mb-6">Owner Sign In</h1>

        {status === "sent" ? (
          <div className="card">
            <h2 className="text-2xl mb-3">Check your email</h2>
            <p className="text-lg">
              We sent a one-tap sign-in link to <strong>{email}</strong>.
              The link expires in 15 minutes.
            </p>
            <p className="text-base mt-4 text-ink">
              Did not arrive? Check your spam folder, or{" "}
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="text-primary underline font-semibold"
              >
                try a different email
              </button>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <p className="text-lg mb-6">
              Enter the email address on file with the HOA. We will send you a
              one-tap sign-in link — no password required.
            </p>
            <label htmlFor="email" className="block text-lg font-semibold mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mb-6"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={status === "sending" || !email}
              className="btn w-full disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send me a sign-in link"}
            </button>
            {error && (
              <p className="mt-4 text-danger text-base" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
