"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AdminOrdersPage() {
  const [local, setLocal] = useState<Array<{
    id: string; status: string; totalAmount: number; customerEmail: string; ticimaxOrderCode: string | null; createdAt: string;
  }>>([]);

  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setLocal(d.local || []));
  }, []);

  return (
    <AdminShell title="Siparişler">
      <div className="admin-card">
        <table className="table">
          <thead>
            <tr><th>Yerel ID</th><th>Ticimax</th><th>E-posta</th><th>Tutar</th><th>Durum</th><th>Tarih</th></tr>
          </thead>
          <tbody>
            {local.map((o) => (
              <tr key={o.id}>
                <td>{o.id.slice(0, 8)}</td>
                <td>{o.ticimaxOrderCode || "—"}</td>
                <td>{o.customerEmail}</td>
                <td>{formatCurrency(o.totalAmount)}</td>
                <td>{o.status}</td>
                <td>{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
