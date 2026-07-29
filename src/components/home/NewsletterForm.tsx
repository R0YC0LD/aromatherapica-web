"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitted");
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <label htmlFor="newsletter-email">E-posta adresiniz</label>
      <div>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="E-posta adresiniz"
          required
          disabled={status === "submitted"}
        />
        <button type="submit" disabled={status === "submitted"}>
          {status === "submitted" ? "Alındı" : "Kayıt ol"}
        </button>
      </div>
      <label className="consent">
        <input type="checkbox" required disabled={status === "submitted"} />
        <span>İletişim izni ve aydınlatma metnini kabul ediyorum.</span>
      </label>
      {status === "submitted" ? (
        <p className="newsletter-note">
          Talebiniz alındı. Bülten kaydı yakında aktif olacak — şimdilik ekibimiz notunu aldı.
        </p>
      ) : null}
    </form>
  );
}
