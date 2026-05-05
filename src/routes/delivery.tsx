import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { DeliveryModule } from "@/modules/delivery";
import type { DeliveryOrder, DeliveryStatus } from "@/modules/delivery/types";

const API_URL = "https://automation-system-production-2711.up.railway.app";

export const Route = createFileRoute("/delivery")({
  component: DeliveryPage,
  head: () => ({
    meta: [
      { title: "Delivery" },
      { name: "description", content: "Manage delivery orders and routes." },
    ],
  }),
});

const CLIENT_ID = 1;

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

function DeliveryPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Safety net: never let the loading state hang past 5 seconds
    const failsafe = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/clients`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("RAW DATA:", data);

        const list: any[] = Array.isArray(data) ? data : [];
        console.log("CLIENT LIST:", list);

        const client = list.find((c) => String(c?.id) === String(CLIENT_ID));
        console.log("FOUND CLIENT:", client);

        if (!client) {
          console.warn("CLIENT NOT FOUND");
          setOrders([]);
          setIsLoading(false);
          return;
        }

        const grouped = client.orders_grouped ?? {};
        const raw: any[] = [
          ...(grouped.this_week ?? []),
          ...(grouped.last_week ?? []),
        ];

        const mapped = raw.map(transformOrder);
        console.log("MAPPED ORDERS:", mapped);

        setOrders(mapped);
        setIsLoading(false);
      } catch (e: any) {
        console.error("Failed to load orders:", e);
        setError(e?.message ?? JSON.stringify(e));
        setIsLoading(false);
      }
    };

    fetchOrders();

    return () => clearTimeout(failsafe);
  }, []);

  return (
    <AppShell>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">Error: {error}</p>
      ) : (
        <DeliveryModule clientId={CLIENT_ID} initialOrders={orders} />
      )}
    </AppShell>
  );
}