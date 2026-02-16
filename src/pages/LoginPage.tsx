import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("admin@cakeynuts.co.uk");
  const [password, setPassword] = useState("StrongPass@123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (ex: any) {
      setErr("Login failed. Check email/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(135deg, var(--color-bg) 0%, #F8BBD0 100%)",
      padding: "20px"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: "420px", textAlign: "center", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}>
        <h1 style={{ marginBottom: "8px", fontSize: "2rem", color: "var(--color-primary-dark)" }}>CakeyNuts</h1>
        <p style={{ marginBottom: "32px", color: "var(--color-text-muted)" }}>Sweet Admin Dashboard</p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              type="email"
              required
            />
          </div>
          <div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
            />
          </div>

          {err && (
            <div style={{
              background: "#FFEBEE",
              color: "#C62828",
              padding: "12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem"
            }}>
              {err}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "8px", padding: "14px" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: "24px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          © 2026 CakeyNuts Ltd.
        </div>
      </div>
    </div>
  );
}
