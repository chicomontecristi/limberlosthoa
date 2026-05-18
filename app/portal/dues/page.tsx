"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { formatCurrency, formatDateShort } from "@/lib/format";

interface Owner {
  id: string;
  full_name: string;
  property_id: string;
}
interface Due {
  id: string;
  period: string;
  amount_cents: number;
  status: "paid" | "due" | "pending" | "waived";
  due_date: string;
  paid_date: string | null;
}

export default function MyDuesPage() {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data: o } = await sb
        .from("owners")
        .select("id, full_name, property_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (!o) {
        setError("We could not find your owner record. Please contact the board.");
        setLoading(false);
        return;
      }
      setOwner(o);
      const { data: d } = await sb
        .from("dues")
        .select("id, period, amount_cents, status, due_date, paid_date")
        .eq("owner_id", o.id)
        .order("due_date", { ascending: false });
      setDues(d ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-lg">Loading your dues…</p>;
  if (error) return <p className="text-lg text-danger">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl mb-2">My Dues</h1>
      {owner && (
        <p className="text-lg mb-8 text-ink">
          {owner.full_name} &middot; Property {owner.property_id}
        </p>
      )}

      {dues.length === 0 ? (
        <p className="text-lg">No dues recorded yet.</p>
      ) : (
        <ul className="space-y-4">
          {dues.map((d) => (
            <li key={d.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl mb-1">Period: {d.period}</h2>
                  <p className="text-lg">{formatCurrency(d.amount_cents)}</p>
                  <p className="text-base text-ink mt-1">
                    Due {formatDateShort(d.due_date)}
                  </p>
                  {d.paid_date && (
                    <p className="text-base text-success mt-1">
                      Received {formatDateShort(d.paid_date)}
                    </p>
                  )}
                </div>
                <span className={`status-${d.status}`}>
                  {d.status.toUpperCase()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="card mt-10 bg-surfaceAlt">
        <h2 className="text-xl mb-2">How to pay</h2>
        <p className="text-base">
          Mail your check to the address shown on the dues invoice, or contact
          the board for in-person payment. The HOA does not process electronic
          payments through this portal.
        </p>
      </div>
    </div>
  );
}
