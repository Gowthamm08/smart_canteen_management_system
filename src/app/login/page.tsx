"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Login failed"); return; }
      router.replace("/dashboard"); router.refresh();
    } catch { setError("Unable to connect to the server. Please try again."); }
    finally { setLoading(false); }
  }

  return <main className="auth-shell">
    <div className="auth-photo" aria-hidden="true"><div className="auth-photo-copy"><span>THE CAMPUS TABLE</span><p>A thoughtful pause<br/>in the middle of your day.</p></div></div>
    <section className="auth-panel">
      <BrandLogo appearance="dark" />
      <div className="auth-content"><p className="eyebrow">WELCOME BACK</p><h1>Good to see<br/><em>you again.</em></h1><p className="auth-intro">Sign in to continue to your campus table.</p>
        <form onSubmit={handleLogin} className="auth-form">
          <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          <label htmlFor="password">Password</label><div className="password-field"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password"/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button></div>
          {error && <p className="form-message error" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="auth-submit">{loading ? "Signing in…" : "Sign in"}<span aria-hidden="true">↗</span></button>
        </form>
        <p className="auth-switch">New to Smart Canteen? <Link href="/signup">Create an account</Link></p>
      </div>
      <p className="auth-footnote">A better dining experience, made for campus.</p>
    </section>
  </main>;
}
