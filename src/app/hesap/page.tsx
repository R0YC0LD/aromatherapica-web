"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import {
  clearMemberSession,
  getMemberSession,
  loginLocalMember,
  registerLocalMember,
  setMemberSession,
  type MemberProfile,
} from "@/lib/auth/member-store";
import { withBasePath } from "@/lib/paths";

type Mode = "login" | "register";

export default function AccountPage() {
  const { settings } = useCatalogOverrides();
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [ready, setReady] = useState(false);

  const logoSrc = settings.logoUrl?.startsWith("data:")
    ? settings.logoUrl
    : withBasePath(settings.logoUrl || "/aromatherapica-emblem.png");

  useEffect(() => {
    setMember(getMemberSession());
    setReady(true);
  }, []);

  async function tryServerLogin(email: string, password: string) {
    try {
      const res = await fetch(withBasePath("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 404) return null;
      const data = (await res.json().catch(() => ({}))) as { error?: string; memberId?: number };
      if (!res.ok) return { ok: false as const, error: data.error || "Giriş başarısız" };
      return { ok: true as const, memberId: data.memberId };
    } catch {
      return null;
    }
  }

  async function tryServerRegister(payload: Record<string, string>) {
    try {
      const res = await fetch(withBasePath("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 404) return null;
      const data = (await res.json().catch(() => ({}))) as { error?: string; memberId?: number };
      if (!res.ok) return { ok: false as const, error: data.error || "Kayıt başarısız" };
      return { ok: true as const, memberId: data.memberId };
    } catch {
      return null;
    }
  }

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const server = await tryServerLogin(email, password);
    if (server?.ok) {
      const local = await loginLocalMember(email, password).catch(() => null);
      const profile =
        local && local.ok
          ? local.member
          : {
              id: String(server.memberId || "server"),
              email,
              firstName: email.split("@")[0] || "Üye",
              lastName: "",
              createdAt: new Date().toISOString(),
            };
      setMemberSession(profile);
      setMember(profile);
      setMessage("Giriş başarılı. Hoş geldiniz.");
      setBusy(false);
      return;
    }
    if (server && !server.ok) {
      // Fall through to local if server rejects with config errors
      if (!/yapılandır|Ticimax|eksik/i.test(server.error || "")) {
        setError(server.error);
        setBusy(false);
        return;
      }
    }

    const local = await loginLocalMember(email, password);
    if (!local.ok) {
      setError(local.error);
      setBusy(false);
      return;
    }
    setMember(local.member);
    setMessage("Giriş başarılı. Hoş geldiniz.");
    setBusy(false);
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      phone: String(form.get("phone") || ""),
    };

    const server = await tryServerRegister(payload);
    if (server?.ok) {
      const local = await registerLocalMember(payload);
      if (local.ok) setMember(local.member);
      else {
        setMember({
          id: String(server.memberId || "server"),
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone || undefined,
          createdAt: new Date().toISOString(),
        });
      }
      setMode("login");
      setMessage("Hesabınız oluşturuldu. Giriş yaptınız.");
      setBusy(false);
      return;
    }
    if (server && !server.ok && !/yapılandır|Ticimax|eksik/i.test(server.error || "")) {
      setError(server.error);
      setBusy(false);
      return;
    }

    const local = await registerLocalMember(payload);
    if (!local.ok) {
      setError(local.error);
      setBusy(false);
      return;
    }
    setMember(local.member);
    setMessage("Hesabınız oluşturuldu. Hoş geldiniz.");
    setBusy(false);
  }

  function logout() {
    clearMemberSession();
    setMember(null);
    setMode("login");
    setMessage("Çıkış yaptınız.");
    setError(null);
  }

  if (!ready) {
    return (
      <section className="account-page">
        <div className="account-card">
          <p className="account-muted">Yükleniyor…</p>
        </div>
      </section>
    );
  }

  if (member) {
    return (
      <section className="account-page">
        <div className="account-card">
          <div className="account-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" width={56} height={56} />
            <strong>{settings.siteName || "Aromatherapica"}</strong>
          </div>
          <p className="account-kicker">Hesabım</p>
          <h1>
            Merhaba, {member.firstName}
            {member.lastName ? ` ${member.lastName}` : ""}
          </h1>
          <p className="account-muted">{member.email}</p>
          {message ? <p className="account-flash">{message}</p> : null}
          <div className="account-actions">
            <Link className="button button-primary" href="/sepet">
              Sepetime git
            </Link>
            <Link className="button button-outline" href="/kategori/tum-urunler">
              Alışverişe devam et
            </Link>
            <button type="button" className="account-text-btn" onClick={logout}>
              Çıkış yap
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="account-page">
      <div className="account-card">
        <div className="account-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={56} height={56} />
          <strong>{settings.siteName || "Aromatherapica"}</strong>
          <span>Essential Oils &amp; Aromatherapy</span>
        </div>

        {mode === "login" ? (
          <>
            <p className="account-kicker">Üye girişi</p>
            <h1>Hesabınıza giriş yapın</h1>
            <p className="account-muted">Siparişlerinizi takip etmek ve alışverişi hızlandırmak için giriş yapın.</p>

            {error ? <p className="account-flash is-error">{error}</p> : null}
            {message ? <p className="account-flash">{message}</p> : null}

            <form className="account-form" onSubmit={onLogin}>
              <div className="form-field">
                <label htmlFor="login-email">E-posta</label>
                <input id="login-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="form-field">
                <label htmlFor="login-password">Şifre</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <button className="button button-primary" type="submit" disabled={busy}>
                {busy ? "Giriş yapılıyor…" : "Giriş yap"}
              </button>
            </form>

            <div className="account-switch">
              <p>Hesabınız yok mu?</p>
              <button
                type="button"
                className="account-text-btn"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setMessage(null);
                }}
              >
                Hesabım yok — kayıt ol
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="account-kicker">Yeni üyelik</p>
            <h1>Hesap oluşturun</h1>
            <p className="account-muted">Birkaç bilgiyle üye olun; ardından hemen alışverişe devam edebilirsiniz.</p>

            {error ? <p className="account-flash is-error">{error}</p> : null}
            {message ? <p className="account-flash">{message}</p> : null}

            <form className="account-form" onSubmit={onRegister}>
              <div className="account-form-row">
                <div className="form-field">
                  <label htmlFor="firstName">Ad</label>
                  <input id="firstName" name="firstName" autoComplete="given-name" required />
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">Soyad</label>
                  <input id="lastName" name="lastName" autoComplete="family-name" required />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="reg-email">E-posta</label>
                <input id="reg-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="form-field">
                <label htmlFor="reg-password">Şifre</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-field">
                <label htmlFor="phone">Telefon (isteğe bağlı)</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" />
              </div>
              <button className="button button-primary" type="submit" disabled={busy}>
                {busy ? "Kayıt yapılıyor…" : "Kayıt ol"}
              </button>
            </form>

            <div className="account-switch">
              <p>Zaten hesabınız var mı?</p>
              <button
                type="button"
                className="account-text-btn"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setMessage(null);
                }}
              >
                Giriş ekranına dön
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
