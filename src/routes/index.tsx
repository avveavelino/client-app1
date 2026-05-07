import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Inbox, Bell } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Section } from "@/components/shell/Section";
import { EmptyState } from "@/components/shell/EmptyState";
import { OrderRow } from "@/modules/delivery/OrderRow";
import type { DeliveryOrder, DeliveryStatus } from "@/modules/delivery/types";
import { useSettings, resolveContactFlags } from "@/lib/settings-store";

const API_URL = "https://automation-system-production-2711.up.railway.app";
const CLIENT_ID = 1;

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Hem" },
      { name: "description", content: "Din aktivitet och notiser." },
    ],
  }),
});

const VALID_STATUSES: DeliveryStatus[] = [
  "pending",
  "in_route",
  "delivering",
  "delivered",
  "done",
];

function toDeliveryStatus(raw: unknown): DeliveryStatus {
  return VALID_STATUSES.includes(raw as DeliveryStatus)
    ? (raw as DeliveryStatus)
    : "pending";
}

function transformOrder(o: any): DeliveryOrder {
  return {
    id: String(o.id),
    customerName: o.name ?? "",
    address: o.address ?? "",
    status: toDeliveryStatus(o.status),
    deliveryDate: o.delivery_date ?? o.order_date,
    email: o.email,
    phone: o.phone,
    products: Array.isArray(o.products) ? o.products : undefined,
    price: o.price,
    deliveryNote: o.delivery_note,
  };
}

function Index() {
  const { settings } = useSettings();
  const contactFlags = resolveContactFlags(settings);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/clients`)
      .then((res) => res.json())
      .then((data) => {
        const list: any[] = Array.isArray(data) ? data : [];
        const client = list.find((c) => String(c?.id) === String(CLIENT_ID));
        if (!client) {
          setOrders([]);
          return;
        }
        const grouped = client.orders_grouped ?? {};
        const raw: any[] = [
          ...(grouped.this_week ?? []),
          ...(grouped.last_week ?? []),
        ];
        setOrders(raw.map(transformOrder));
      })
      .catch((err) => console.error("Failed to fetch orders:", err));
  }, []);

  const visibleOrders = orders.filter((o) => {
    if (
      !settings.showCompletedOrders &&
      (o.status === "delivered" || o.status === "done")
    ) {
      return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <Section title="Beställningar & Aktivitet">
          {visibleOrders.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title="Inga beställningar"
              description="Din aktivitet visas här."
            />
          ) : (
            <ul className="space-y-2.5">
              {visibleOrders.map((o) => (
                <li key={o.id}>
                  <OrderRow
                    order={o}
                    selected={false}
                    onToggle={() => {}}
                    contactFlags={contactFlags}
                  />
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