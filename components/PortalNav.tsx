"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

const TABS = [
  { href: "/portal/documents/", label: "HOA Documents" },
  { href: "/portal/events/",    label: "Community Events" },
  { href: "/portal/members/",   label: "Members" },
  { href: "/portal/dues/",      label: "My Dues" },
];

const ADMIN_TABS = [
  { href: "/admin/dues/",  label: "Manage Dues" },
  { href: "/admin/email/", label: "Send Announcement" },
];

export default function PortalNav() {
  const pathname = usePathname() ?? "";
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (cancelled) return;
      setEmail(user?.email ?? null);
      if (!user) return;
      const { data } = await sb
        .from("owners")
        .select("is_admin")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setIsAdmin(!!data?.is_admin);
    })();
    return () => { cancelled = true; };
  }, []);

  async function signOut() {
    await getSupabase().auth.signOut();
    window.location.href = "/";
  }

  const tabs = isAdmin ? [...TABS, ...ADMIN_TABS] : TABS;

  return (
    <header className="border-b border-border bg-white">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link href="/portal/documents/" className="text-2xl font-bold text-primary no-underline">
            Limberlost HOA
          </Link>
          <div className="flex items-center gap-3 text-base">
            {email && <span className="hidden sm:inline text-ink">{email}</span>}
            <button onClick={signOut} className="btn-secondary text-base px-4 py-2 min-h-0">
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Portal sections">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  "px-4 py-3 rounded text-lg font-semibold min-h-touch inline-flex items-center " +
                  (active
                    ? "bg-primary text-white"
                    : "bg-surfaceAlt text-ink hover:bg-white border border-border")
                }
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
