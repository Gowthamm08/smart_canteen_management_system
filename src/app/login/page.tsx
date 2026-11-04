
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "800",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Smart Canteen
          </h1>

          <p style={{ color: "#64748b", fontSize: "15px" }}>
            Welcome back! Sign in to continue.
          </p>
        </div>

        <label
          style={{
            display: "block",
            color: "#1f2937",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Email Address
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            marginBottom: "22px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "15px",
            color: "#111827",
            backgroundColor: "#ffffff",
            outlineColor: "#2563eb",
          }}
        />

        <label
          style={{
            display: "block",
            color: "#1f2937",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            marginBottom: "22px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "15px",
            color: "#111827",
            backgroundColor: "#ffffff",
            outlineColor: "#2563eb",
          }}
        />

        {error && (
          <p
            style={{
              color: "#dc2626",
              background: "#fef2f2",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "18px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            background: loading ? "#64748b" : "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "13px",
            marginTop: "25px",
          }}
        >
          Smart Canteen Management System
        </p>
      </form>
    </main>
  );
}
