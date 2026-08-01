import React, { useState } from "react";
import { Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { User } from "@/src/types";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await adminApi.login(email, password);
      onLoginSuccess(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at 50% 30%, rgba(201, 106, 19, 0.08) 0%, #FAF7F2 70%)",
      padding: 20
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#FFFDF7",
        backdropFilter: "blur(16px)",
        border: "1px solid #E8DED1",
        borderRadius: 20,
        padding: 36,
        boxShadow: "0 20px 40px rgba(45, 31, 18, 0.08)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #C96A13 0%, #D97706 100%)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            marginBottom: 16,
            boxShadow: "0 8px 20px rgba(201, 106, 19, 0.25)"
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D1F12" }}>NamanKart Admin</h2>
          <p style={{ color: "#5A4633", fontSize: "0.9rem", marginTop: 4 }}>
            Sign in to access your MongoDB database controls
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(179, 38, 30, 0.1)",
            border: "1px solid rgba(179, 38, 30, 0.3)",
            color: "#B3261E",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: "0.85rem",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label style={{ color: "#5A4633" }}>Admin Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: 14, top: 12, color: "#8A6A55" }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: 42 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@namankart.com"
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 24 }}>
            <label style={{ color: "#5A4633" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: 14, top: 12, color: "#8A6A55" }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: 42 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", height: 46, fontSize: "0.95rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: "0.8rem", color: "#8A6A55" }}>
            Connected to MongoDB Atlas Cluster
          </div>
        </form>
      </div>
    </div>
  );
};

