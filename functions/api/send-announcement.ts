/**
 * Cloudflare Pages Function — POST /api/send-announcement
 *
 * Verifies the caller is an HOA admin (via Supabase JWT), pulls every
 * owner email from the DB, and fans out a single Resend batch.
 *
 * Env vars (set in Cloudflare Pages → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 *   RESEND_FROM_EMAIL
 */

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Missing auth token" }, 401);

    // Verify the JWT against Supabase and confirm admin.
    const userRes = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${token}`,
      },
    });
    if (!userRes.ok) return json({ error: "Invalid session" }, 401);
    const user = (await userRes.json()) as { id: string; email: string };

    const adminCheck = await sbFetch(
      env,
      `/rest/v1/owners?auth_user_id=eq.${user.id}&select=id,is_admin`,
    );
    const adminRow = (await adminCheck.json())[0];
    if (!adminRow?.is_admin) return json({ error: "Admins only" }, 403);

    const { subject, body } = (await request.json()) as {
      subject: string;
      body: string;
    };
    if (!subject?.trim() || !body?.trim())
      return json({ error: "Subject and body required" }, 400);

    // Pull all owner emails.
    const ownersRes = await sbFetch(env, `/rest/v1/owners?select=email`);
    const owners: { email: string }[] = await ownersRes.json();
    const recipients = owners.map((o) => o.email).filter(Boolean);
    if (recipients.length === 0)
      return json({ error: "No owner emails found" }, 400);

    // Send via Resend (BCC pattern — keeps recipient list private).
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: env.RESEND_FROM_EMAIL, // visible "To" is the board itself
        bcc: recipients,
        subject,
        text: body,
        html: markdownToHtml(body),
      }),
    });
    if (!resendRes.ok) {
      const err = await resendRes.text();
      return json({ error: "Resend failed: " + err }, 502);
    }
    const sent = (await resendRes.json()) as { id?: string };

    // Audit log.
    await sbFetch(env, `/rest/v1/announcements`, {
      method: "POST",
      body: JSON.stringify({
        sent_by: adminRow.id,
        subject,
        body_md: body,
        recipients: recipients.length,
        resend_id: sent.id ?? null,
      }),
    });

    return json({ ok: true, recipients: recipients.length, id: sent.id });
  } catch (e: any) {
    return json({ error: e.message ?? "Server error" }, 500);
  }
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function sbFetch(env: Env, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("apikey", env.SUPABASE_SERVICE_ROLE_KEY);
  headers.set("authorization", `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  headers.set("prefer", "return=representation");
  return fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}${path}`, { ...init, headers });
}

// Tiny inline Markdown → HTML for paragraphs, bold, italic, and links.
function markdownToHtml(md: string): string {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
  return `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:18px;line-height:1.6;color:#0F1B2D">${html}</div>`;
}
