"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallbackTitle?: string };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Aromatherapica UI error:", error);
    try {
      sessionStorage.setItem(
        "arom_last_ui_error",
        `${error.name}: ${error.message}\n${error.stack || ""}`.slice(0, 2000),
      );
    } catch {
      /* ignore */
    }
  }

  render() {
    if (this.state.error) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      return (
        <div className="app-error-fallback" role="alert">
          <h1>{this.props.fallbackTitle || "Sayfa yüklenemedi"}</h1>
          <p>Bir şeyler ters gitti. Yenileyin veya ana sayfaya dönün.</p>
          <div className="app-error-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Yenile
            </button>
            <a className="button button-outline" href={`${base}/`}>
              Ana sayfa
            </a>
          </div>
          {this.state.error?.message ? (
            <p className="app-error-detail">{this.state.error.message}</p>
          ) : null}
        </div>
      );
    }
    return this.props.children;
  }
}
