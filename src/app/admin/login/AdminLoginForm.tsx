"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Giriş başarısız");
      return;
    }
    if (data.csrfToken) sessionStorage.setItem("admin_csrf", data.csrfToken);
    if (data.mustChangePassword) {
      router.push("/admin/sifre-degistir");
      return;
    }
    router.push(search.get("next") || "/admin");
  }

  return (
    <div className="admin-shell">
      <main style={{ maxWidth: 420 }}>
        <h1>Admin giriş</h1>
        <p style={{ color: "#9fb4d0" }}>
          Gizli logo tıklaması yalnızca keşif içindir; güvenlik oturum doğrulamasındadır.
        </p>
        <form onSubmit={onSubmit} className="admin-card">
          <div className="form-field">
            <label htmlFor="username">Kullanıcı adı</label>
            <input id="username" name="username" autoComplete="username" required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Şifre</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error ? <p style={{ color: "#f0a0a0" }}>{error}</p> : null}
          <button className="btn" type="submit">
            Giriş
          </button>
        </form>
      </main>
    </div>
  );
}
