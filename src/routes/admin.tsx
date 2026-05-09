import { useEffect, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminSystemControls } from "@/components/admin/AdminSystemControls";
import { AdminClientSelector } from "@/components/admin/AdminClientSelector";
import { AdminClientControls } from "@/components/admin/AdminClientControls";
import { AdminClientLogs } from "@/components/admin/AdminClientLogs";
import { api } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Kontrollpanel" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface ClientFull {
  id: number | string;
  name: string;
  active?: boolean;
  orders?: any[];
}

function AdminPage() {
  return (
    <AdminGate>
      <AdminPanel />
    </AdminGate>
  );
}

function AdminPanel() {
  const { lock } = useAdminAuth();
  const [clients, setClients] = useState<ClientFull[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api("/clients");
      const data = await res.json();
      const list: ClientFull[] = Array.isArray(data) ? data : [];
      setClients(list);
      if (list.length && !selectedId) {
        setSelectedId(String(list[0].id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = clients.find((c) => String(c.id) === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Kontrollpanel
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Operativ övervakning och återhämtning
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={lock}
            className="gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Lås
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-5">
        <AdminSystemControls />

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-stone-600" />
            <h2 className="text-sm font-semibold text-foreground">Klienter</h2>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Laddar klienter…</p>
          ) : (
            <AdminClientSelector
              clients={clients.map((c) => ({
                id: c.id,
                name: c.name,
                active: c.active,
              }))}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </section>

        {selected && (
          <>
            <AdminClientControls
              client={{
                id: selected.id,
                name: selected.name,
                active: selected.active,
                orderCount: Array.isArray(selected.orders)
                  ? selected.orders.length
                  : 0,
              }}
              onChanged={load}
            />
            <AdminClientLogs clientName={selected.name} />
          </>
        )}
      </main>
    </div>
  );
}