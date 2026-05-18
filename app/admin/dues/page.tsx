"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { formatCurrency, formatDateShort } from "@/lib/format";

interface Row {
  due_id: string;
  owner_id: string;
  full_name: string;
  property_id: string;
  period: string;
  amount_cents: number;
  status: "paid" | "due" | "pending" | "waived";
  due_date: string;
  paid_date: string | null;
  note: string | null;
}

export default function AdminDuesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRows(); }, []);

  async function loadRows() {
    setLoading(true);
    const sb = getSupabase();
    const { data: owners } = await sb
      .from("owners")
      .select("id, full_name, property_id")
      .order("property_id");
    if (!owners) { setLoading(false); return; }

    const { data: dues } = await sb
      .from("dues")
      .select("id, owner_id, period, amount_cents, status, due_date, paid_date, note");

    const latestByOwner = new Map<string, Row>();
    for (const d of dues ?? []) {
      const o = owners.find((x) => x.id === d.owner_id);
      if (!o) continue;
      const existing = latestByOwner.get(o.id);
      if (!existing || new Date(d.due_date) > new Date(existing.due_date)) {
        latestByOwner.set(o.id, {
          due_id: d.id, owner_id: o.id, full_name: o.full_name,
          property_id: o.property_id, period: d.period,
          amount_cents: d.amount_cents, status: d.status,
          due_date: d.due_date, paid_date: d.paid_date, note: d.note,
        });
      }
    }
    // Include owners with no dues row yet.
    for (const o of owners) {
      if (!latestByOwner.has(o.id)) {
        latestByOwner.set(o.id, {
          due_id: "", owner_id: o.id, full_name: o.full_name,
          property_id: o.property_id, period: "—", amount_cents: 0,
          status: "due", due_date: "", paid_date: null, note: null,
        });
      }
    }
    setRows([...latestByOwner.values()].sort((a, b) =>
      a.property_id.localeCompare(b.property_id)
    ));
    setLoading(false);
  }

  async function updateStatus(row: Row, status: Row["status"]) {
    if (!row.due_id) return;
    setSaving(row.due_id);
    const sb = getSupabase();
    const patch: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === "paid") patch.paid_date = new Date().toISOString().slice(0, 10);
    if (status !== "paid") patch.paid_date = null;
    await sb.from("dues").update(patch).eq("id", row.due_id);
    setRows((prev) =>
      prev.map((r) =>
        r.due_id === row.due_id ? { ...r, status, paid_date: patch.paid_date ?? null } : r
      )
    );
    setSaving(null);
  }

  const visible = useMemo(() => {
    const q = filter.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.property_id.toLowerCase().includes(q) ||
        r.status.includes(q)
    );
  }, [rows, filter]);

  if (loading) return <p className="text-lg">Loading dues…</p>;

  return (
    <div>
      <h1 className="text-3xl mb-2">Manage Dues</h1>
      <p className="text-lg mb-6">
        {rows.length} properties &middot; updates save instantly.
      </p>

      <div className="mb-6">
        <label htmlFor="filter" className="sr-only">Filter</label>
        <input
          id="filter"
          type="search"
          placeholder="Search by name, property ID, or status…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-md"
        />
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-left text-base">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={r.owner_id} className={i % 2 === 1 ? "bg-surfaceAlt" : ""}>
                <td className="px-4 py-3 font-semibold">{r.property_id}</td>
                <td className="px-4 py-3">{r.full_name}</td>
                <td className="px-4 py-3">{r.period}</td>
                <td className="px-4 py-3">{formatCurrency(r.amount_cents)}</td>
                <td className="px-4 py-3">
                  {r.due_date ? formatDateShort(r.due_date) : "—"}
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Status for ${r.full_name}`}
                    value={r.status}
                    disabled={!r.due_id || saving === r.due_id}
                    onChange={(e) => updateStatus(r, e.target.value as Row["status"])}
                    className="input py-2 min-h-0 text-base"
                  >
                    <option value="due">Due</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
