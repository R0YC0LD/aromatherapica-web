"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function ChangePasswordPage() {
  const [csrf, setCsrf] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setCsrf(d.csrfToken || ""));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
        csrfToken: csrf,
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Şifre güncellendi" : data.error || "Hata");
  }

  return (
    <AdminShell title="Şifre değiştir">
      <p style={{ color: "#9fb4d0" }}>
        Production ortamında varsayılan <code>12345</code> şifresi ile giriş sonrası şifre değişimi zorunludur.
      </p>
      <form onSubmit={onSubmit} className="admin-card" style={{ maxWidth: 420 }}>
        <div className="form-field">
          <label htmlFor="currentPassword">Mevcut şifre</label>
          <input id="currentPassword" name="currentPassword" type="password" required />
        </div>
        <div className="form-field">
          <label htmlFor="newPassword">Yeni şifre (min 8)</label>
          <input id="newPassword" name="newPassword" type="password" required minLength={8} />
        </div>
        {message ? <p>{message}</p> : null}
        <button className="btn" type="submit">Kaydet</button>
      </form>
    </AdminShell>
  );
}
