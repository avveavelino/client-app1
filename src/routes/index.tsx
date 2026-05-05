import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Inbox, Bell } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Section } from "@/components/shell/Section";
import { EmptyState } from "@/components/shell/EmptyState";
 
export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Hem" },
      { name: "description", content: "Din aktivitet och notiser." },
    ],
  }),
});
 
function Index() {
  const [orders, setOrders] = useState<any[]>([]);
 
  useEffect(() => {
    fetch("http://127.0.0.1:5000/clients")
      .then((res) => res.json())
      .then((data) => {
        const client = data.find((c: any) => c.id === 1);
        if (client && client.orders) {
          setOrders(client.orders);
        }
      })
      .catch((err) => console.error("Failed to fetch orders:", err));
  }, []);
 
  const statusMap: Record<string, string> = {
    pending: "Väntar",
    in_route: "På rutt",
    delivering: "På väg",
    delivered: "Levererad",
    done: "Klar",
  };
 
  return (
    <AppShell>
      <div className="space-y-6">
        <Section title="Beställningar & Aktivitet">
          {orders.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title="Inga beställningar"
              description="Din aktivitet visas här."
            />
          ) : (
            <ul className="space-y-2">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-border p-3"
                >
                  <p className="font-medium">{o.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.address}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {statusMap[o.status] || o.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
 
        <Section title="Meddelanden & Notiser">
          <EmptyState
            icon={<Bell className="h-5 w-5" />}
            title="Ingen data än"
            description="Allt är uppdaterat."
          />
        </Section>
      </div>
    </AppShell>
  );
}