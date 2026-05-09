import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useAdminAuth, getExpectedPassword } from "@/lib/admin-store";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { unlocked, unlock } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (unlocked) return <>{children}</>;

  const noPasswordConfigured = !getExpectedPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (noPasswordConfigured) {
      setError("VITE_ADMIN_PASSWORD är inte satt.");
      return;
    }

    if (!unlock(password)) {
      setError("Fel lösenord");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafaf9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 24,
          background: "white",
          border: "1px solid #e7e5e4",
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ background: "#f5f5f4", padding: 12, borderRadius: 999 }}>
            <Lock style={{ width: 20, height: 20, color: "#57534e" }} />
          </div>
          <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Kontrollpanel</h1>
          <p style={{ fontSize: 12, color: "#78716c", margin: 0 }}>Endast intern åtkomst</p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lösenord"
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 14,
              border: "1px solid #e7e5e4",
              borderRadius: 6,
              background: "white",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {error && <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{error}</p>}
          <Button type="submit" style={{ width: "100%" }}>
            Lås upp
          </Button>
        </form>
      </div>
    </div>
  );
}