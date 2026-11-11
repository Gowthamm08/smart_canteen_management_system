
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#111827",
    backgroundColor: "#ffffff",
    outlineColor: "#2563eb",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9",
        padding: "25px 20px",
      }}
    >
      <form
        onSubmit={handleSignup}
        style={{
          background: "#ffffff",
          padding: "35px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "800",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Create Account
          </h1>

          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Join Smart Canteen today!
          </p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", color: "#1f2937", marginBottom: "7px" }}>
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            maxLength={100}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", color: "#1f2937", marginBottom: "7px" }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", color: "#1f2937", marginBottom: "7px" }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter 10-digit phone number"
            pattern="[0-9]{10}"
            maxLength={10}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", color: "#1f2937", marginBottom: "7px" }}>
            Password
          </label>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
              style={{ ...inputStyle, paddingRight: "50px" }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "19px",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontWeight: "600", color: "#1f2937", marginBottom: "7px" }}>
            Confirm Password
          </label>

          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              style={{ ...inputStyle, paddingRight: "50px" }}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "19px",
              }}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && (
          <p style={{
            color: "#dc2626",
            background: "#fef2f2",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "16px",
          }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{
            color: "#15803d",
            background: "#f0fdf4",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "16px",
          }}>
            {success}
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
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p style={{
          textAlign: "center",
          marginTop: "22px",
          color: "#64748b",
          fontSize: "14px",
        }}>
          Already have an account?{" "}
          <a href="/login" style={{
            color: "#2563eb",
            fontWeight: "700",
            textDecoration: "none",
          }}>
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
