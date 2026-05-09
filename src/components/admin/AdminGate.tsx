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
      setError(
        "VITE_ADMIN_PASSWORD är inte satt. Lägg till miljövariabeln för att låsa upp.",
      );
      return;
    }

    if (!unlock(password)) {
      setError("Fel lösenord");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-stone-100 p-3">
            <Lock className="h-5 w-5 text-stone-600" />
          </div>
          <h1 className="text-base font-semibold text-foreground">
            Kontrollpanel
          </h1>
          <p className="text-center text-xs text-muted-foreground">
            Endast intern åtkomst
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lösenord"
            autoFocus
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <Button type="submit" className="w-full">
            Lås upp
          </Button>
        </form>
      </div>
    </div>
  );
}