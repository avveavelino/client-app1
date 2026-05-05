import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { Section } from "@/components/shell/Section";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { OrderRow } from "./OrderRow";
import { DeliveryActions, type DeliveryAction } from "./DeliveryActions";
import type { DeliveryOrder, DeliveryStatus } from "./types";

interface Props {
  clientId: number;
  initialOrders?: DeliveryOrder[];
}

const ACTION_ENDPOINT: Record<DeliveryAction, string> = {
  optimize: "/optimize-from-orders",
  start: "/start-route",
  delivering: "/notify-delivering",
  delivered: "/notify-delivered",
  end: "/end-route",
};

const ACTION_TOAST: Record<DeliveryAction, string> = {
  optimize: "Rutt optimerad",
  start: "Rutt startad",
  delivering: "Markerad som levererar",
  delivered: "Markerad som levererad",
  end: "Rutt avslutad",
};

// Returns 00:00 of the most recent Monday (local time).
function startOfThisWeek(now = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // getDay(): 0 = Sunday, 1 = Monday, … 6 = Saturday
  const dayOfWeek = d.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7; // Mon=0, Tue=1, …, Sun=6
  d.setDate(d.getDate() - daysSinceMonday);
  return d;
}

function isThisWeek(deliveryDate: string | undefined, weekStart: Date): boolean {
  if (!deliveryDate) return true; // missing date → "Denna vecka"
  const t = new Date(deliveryDate).getTime();
  if (isNaN(t)) return true; // unparseable → "Denna vecka"
  return t >= weekStart.getTime();
}

export function DeliveryModule({ clientId, initialOrders = [] }: Props) {
  const [orders, setOrders] = useState<DeliveryOrder[]>(initialOrders);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<DeliveryAction | null>(null);

  const allSelected = orders.length > 0 && selected.size === orders.length;

  const { thisWeek, lastWeek } = useMemo(() => {
    const weekStart = startOfThisWeek();
    const thisWeek: DeliveryOrder[] = [];
    const lastWeek: DeliveryOrder[] = [];
    for (const o of orders) {
      if (isThisWeek(o.deliveryDate, weekStart)) thisWeek.push(o);
      else lastWeek.push(o);
    }
    return { thisWeek, lastWeek };
  }, [orders]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  };

  const updateSelected = (status: DeliveryStatus) => {
    setOrders((prev) =>
      prev.map((o) => (selected.has(o.id) ? { ...o, status } : o)),
    );
  };

  const handleAction = async (action: DeliveryAction) => {
    if (selected.size === 0) {
      toast.warning("Välj minst en order först");
      return;
    }

    if (pendingAction) return;

    const orderIds = Array.from(selected);
    const endpoint = ACTION_ENDPOINT[action];

    setPendingAction(action);

    try {
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          order_ids: orderIds,
        }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || result?.status === "error") {
        toast.error(result?.message || "Misslyckades att utföra åtgärd");
        return;
      }

      if (result?.status === "blocked") {
        toast.warning(result?.message || "Åtgärd blockerad");
        return;
      }

      switch (action) {
        case "optimize": {
          const route: unknown = result?.route;
          if (!Array.isArray(route) || route.length === 0) {
            toast.error("Kunde inte optimera rutt");
            return;
          }
          const url =
            "https://www.google.com/maps/dir/" +
            route.map((a) => encodeURIComponent(String(a))).join("/");
          window.open(url, "_blank");
          break;
        }
        case "start":
          updateSelected("in_route");
          break;
        case "delivering":
          updateSelected("delivering");
          break;
        case "delivered":
          updateSelected("delivered");
          break;
        case "end":
          updateSelected("done");
          setSelected(new Set());
          break;
      }

      toast.success(ACTION_TOAST[action]);
    } catch (err) {
      console.error(err);
      toast.error("Något gick fel");
    } finally {
      setPendingAction(null);
    }
  };

  const renderOrderList = (list: DeliveryOrder[]) => (
    <ul className="space-y-2">
      {list.map((o) => (
        <li key={o.id}>
          <OrderRow
            order={o}
            selected={selected.has(o.id)}
            onToggle={toggle}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-4">
      <DeliveryActions selectedCount={selected.size} onAction={handleAction} />

      {orders.length === 0 ? (
        <Section title="Ordrar">
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title="Inga ordrar"
            description="Leveransordrar visas här."
          />
        </Section>
      ) : (
        <>
          {thisWeek.length > 0 && (
            <Section
              title="Denna vecka"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleSelectAll}
                  className="h-7 px-2 text-xs"
                >
                  {allSelected ? "Rensa alla" : "Välj alla"}
                </Button>
              }
            >
              {renderOrderList(thisWeek)}
            </Section>
          )}

          {lastWeek.length > 0 && (
            <Section title="Förra veckan">
              {renderOrderList(lastWeek)}
            </Section>
          )}
        </>
      )}
    </div>
  );
}