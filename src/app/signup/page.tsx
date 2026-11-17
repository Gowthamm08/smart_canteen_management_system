"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: fullName, email, phone, password, confirmPassword }) });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Registration failed."); return; }
      setSuccess("Account created successfully. Redirecting to sign in…"); setTimeout(() => router.push("/login"), 1500);
    } catch { setError("Unable to connect to the server."); }
    finally { setLoading(false); }
  }
  return <main className="auth-shell signup-shell">
    <div className="auth-photo" aria-hidden="true"><div className="auth-photo-copy"><span>FRESH FROM OUR KITCHEN</span><p>Good food brings<br/>the day together.</p></div></div>
    <section className="auth-panel"><BrandLogo appearance="dark" />
      <div className="auth-content signup-content"><p className="eyebrow">JOIN THE TABLE</p><h1>Your day,<br/><em>served well.</em></h1><p className="auth-intro">Create your account to browse the menu and order with ease.</p>
        <form onSubmit={handleSignup} className="auth-form signup-form">
          <label htmlFor="full-name">Full name</label><input id="full-name" type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" maxLength={100} required />
          <div className="auth-form-row"><div><label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div><div><label htmlFor="phone">Phone number</label><input id="phone" type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit number" pattern="[0-9]{10}" maxLength={10} required /></div></div>
          <div className="auth-form-row"><div><label htmlFor="signup-password">Password</label><div className="password-field"><input id="signup-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></div><div><label htmlFor="confirm-password">Confirm password</label><div className="password-field"><input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required/><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>{showConfirmPassword ? "Hide" : "Show"}</button></div></div></div>
          {error && <p className="form-message error" role="alert">{error}</p>}{success && <p className="form-message success" role="status">{success}</p>}
          <button type="submit" disabled={loading} className="auth-submit">{loading ? "Creating account…" : "Create account"}<span aria-hidden="true">↗</span></button>
        </form><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
      </div><p className="auth-footnote">A better dining experience, made for campus.</p>
    </section>
  </main>;
}
