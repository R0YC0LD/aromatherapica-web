"use client";

import { FormEvent, useState } from "react";

export default function AccountPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Giriş başarılı" : data.error || "Giriş başarısız");
  }

  async function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        password: form.get("password"),
        phone: form.get("phone"),
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Üyelik oluşturuldu (ID: ${data.memberId})` : data.error || "Kayıt başarısız");
  }

  return (
    <section className="section" style={{ display: "grid", gap: "2rem", maxWidth: 720 }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>Hesabım</h1>
      {message ? <p>{message}</p> : null}

      <form onSubmit={login}>
        <h2>Giriş</h2>
        <div className="form-field">
          <label htmlFor="login-email">E-posta</label>
          <input id="login-email" name="email" type="email" required />
        </div>
        <div className="form-field">
          <label htmlFor="login-password">Şifre</label>
          <input id="login-password" name="password" type="password" required />
        </div>
        <button className="btn" type="submit">Giriş yap</button>
      </form>

      <form onSubmit={register}>
        <h2>Üye ol</h2>
        <div className="form-field">
          <label htmlFor="firstName">Ad</label>
          <input id="firstName" name="firstName" required />
        </div>
        <div className="form-field">
          <label htmlFor="lastName">Soyad</label>
          <input id="lastName" name="lastName" required />
        </div>
        <div className="form-field">
          <label htmlFor="reg-email">E-posta</label>
          <input id="reg-email" name="email" type="email" required />
        </div>
        <div className="form-field">
          <label htmlFor="reg-password">Şifre</label>
          <input id="reg-password" name="password" type="password" required minLength={6} />
        </div>
        <div className="form-field">
          <label htmlFor="phone">Telefon</label>
          <input id="phone" name="phone" />
        </div>
        <button className="btn" type="submit">Kayıt ol</button>
      </form>
    </section>
  );
}
