import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { DeliveryModule } from "@/modules/delivery";
import DeliveryIntroAnimation from "@/components/DeliveryIntroAnimation";
import type { DeliveryOrder, DeliveryStatus } from "@/modules/delivery/types";
import { useSettings, resolveContactFlags } from "@/lib/settings-store";

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
  // route_status takes precedence over status for visual display
  let displayStatus: DeliveryStatus;
  if (o.status === "delivered" || o.status === "done") {
    displayStatus = toDeliveryStatus(o.status);
  } else if (o.status === "delivering") {
    displayStatus = "delivering";
  } else if (o.route_status === "in_route") {
    displayStatus = "in_route";
  } else {
    displayStatus = toDeliveryStatus(o.status);
  }

  return {
    id: String(o.id),
    customerName: o.name ?? "",
    address: o.address ?? "",
    status: displayStatus,
    deliveryDate: o.delivery_date ?? o.order_date,
    deliveryDateText: o.delivery_date_text,
    orderDate: o.order_date,
    email: o.email,
    phone: o.phone,
    products: Array.isArray(o.products) ? o.products : undefined,
    price: o.price,
    deliveryNote: o.delivery_note,
  };
}

function DeliveryPage() {
  const { settings } = useSettings();
  const contactFlags = resolveContactFlags(settings);

  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const failsafe = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/clients`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : [];
        const client = list.find((c) => String(c?.id) === String(CLIENT_ID));

        if (!client) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        const grouped = client.orders_grouped ?? {};
        const raw: any[] = [
          ...(grouped.this_week ?? []),
          ...(grouped.last_week ?? []),
        ];

        setOrders(raw.map(transformOrder));
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

  const visibleOrders = orders.filter((o) => {
    // Hide completed/done orders when setting is off
    if (!settings.showCompletedOrders && (o.status === "delivered" || o.status === "done")) {
      return false;
    }
    // Hide orders older than 7 days when setting is off
    if (!settings.showOldOrders) {
      if (o.deliveryDate) {
        const t = new Date(o.deliveryDate).getTime();
        if (!isNaN(t)) {
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (t < sevenDaysAgo) return false;
        }
      }
    }
    return true;
  });

  return (
    <AppShell>
      {showIntro && (
        <DeliveryIntroAnimation onDone={() => setShowIntro(false)} />
      )}

      {!showIntro && (
        <DeliveryModule
          clientId={CLIENT_ID}
          initialOrders={visibleOrders}
          allowDeliveryUpdates={settings.deliveryUpdates}
          allowRouteOptimization={settings.allowRouteOptimization}
          allowRouteStart={settings.allowRouteStart}
          contactFlags={contactFlags}
        />
      )}
    </AppShell>
  );
}