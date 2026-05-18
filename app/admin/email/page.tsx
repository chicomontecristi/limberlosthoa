"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { formatDate } from "@/lib/format";

interface PastEmail {
  id: string;
  subject: string;
  recipients: number;
  sent_at: string;
}

export default function AdminEmailPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PastEmail[]>([]);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    const sb = getSupabase();
    const { data } = await sb
      .from("announcements")
      .select("id, subject, recipients, sent_at")
      .order("sent_at", { ascending: false })
      .limit(10);
    setHistory(data ?? []);
  }

  async function handleSend() {
    setError(null);
    setResult(null);
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    if (!confirm(`Send this announcement to all owners?`)) return;
    setSending(true);
    try {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      const res = await fetch("/api/send-announcement", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ subject, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Send failed");
      setResult(`Sent to ${json.recipients} owners.`);
      setSubject("");
      setBody("");
      await loadHistory();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl mb-6">Send Announcement</h1>

      <div className="card mb-10">
        <label htmlFor="subject" className="block text-lg font-semibold mb-2">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input mb-6"
          placeholder="Summer BBQ — RSVP by Friday"
        />

        <label htmlFor="body" className="block text-lg font-semibold mb-2">
          Message (Markdown supported)
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input mb-6 min-h-[16rem]"
          placeholder="Dear owners,&#10;&#10;Please join us..."
        />

        <button onClick={handleSend} disabled={sending} className="btn">
          {sending ? "Sending…" : "Send to all 45 owners"}
        </button>

        {result && (
          <p className="mt-4 text-success text-lg" role="status">
            {result}
          </p>
        )}
        {error && (
          <p className="mt-4 text-danger text-lg" role="alert">
            {error}
          </p>
        )}
      </div>

      <h2 className="text-2xl mb-4">Email History</h2>
      {history.length === 0 ? (
        <p className="text-lg">No announcements sent yet.</p>
      ) : (
        <ul className="space-y-3">
          {history.map((h) => (
            <li key={h.id} className="card">
              <p className="text-xl font-semibold">{h.subject}</p>
              <p className="text-base text-ink">
                Sent {formatDate(h.sent_at)} &middot; {h.recipients} recipients
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
