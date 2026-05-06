import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { DeliveryModule } from "@/modules/delivery";
import DeliveryIntroAnimation from "@/components/DeliveryIntroAnimation";
import type { DeliveryOrder, DeliveryStatus } from "@/modules/delivery/types";

const API_URL = "http://127.0.0.1:5000";

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

    return () => {
      clearTimeout(failsafe);
    };
  }, []);

  return (
    <AppShell>
      {showIntro && (
        <DeliveryIntroAnimation onDone={() => setShowIntro(false)} />
      )}
 
      {!showIntro && (
        isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">Error: {error}</p>
        ) : (
          <DeliveryModule clientId={CLIENT_ID} initialOrders={orders} />
        )
      )}
    </AppShell>
  );
}

function EntryVan() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      <div
        style={{
          width: "140px",
          height: "80px",
          position: "absolute",
          top: "0",
          left: "0",
          offsetPath:
            "path('M -180 50vh L 30vw 50vh Q 50vw 50vh, 50vw 35vh Q 50vw 20vh, 30vw 20vh Q 10vw 20vh, 30vw 50vh L calc(100vw + 200px) 50vh')",
          offsetRotate: "auto",
          animation: "vanEntry 3.5s ease-in-out forwards",
        }}
      >
        <div style={{ animation: "vanBob 0.4s ease-in-out infinite" }}>
          <svg width="140" height="80" viewBox="0 0 140 80" fill="none">
            <ellipse cx="70" cy="73" rx="55" ry="2.5" fill="#000" opacity="0.12" />
            <rect
              x="10"
              y="22"
              width="70"
              height="40"
              rx="3"
              fill="#fef3c7"
              stroke="#92400e"
              strokeWidth="1.5"
            />
            <rect x="10" y="40" width="70" height="3" fill="#f59e0b" />
            <path
              d="M80 30 L110 30 L122 45 L122 62 L80 62 Z"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="1.5"
            />
            <path
              d="M85 33 L107 33 L116 45 L85 45 Z"
              fill="#bae6fd"
              stroke="#0c4a6e"
              strokeWidth="1"
            />
            <g
              style={{
                transformOrigin: "30px 64px",
                animation: "vanWheelSpin 0.4s linear infinite",
              }}
            >
              <circle cx="30" cy="64" r="8" fill="#1c1917" />
              <circle cx="30" cy="64" r="3" fill="#78716c" />
              <line x1="30" y1="56" x2="30" y2="72" stroke="#78716c" strokeWidth="1" />
              <line x1="22" y1="64" x2="38" y2="64" stroke="#78716c" strokeWidth="1" />
            </g>
            <g
              style={{
                transformOrigin: "100px 64px",
                animation: "vanWheelSpin 0.4s linear infinite",
              }}
            >
              <circle cx="100" cy="64" r="8" fill="#1c1917" />
              <circle cx="100" cy="64" r="3" fill="#78716c" />
              <line x1="100" y1="56" x2="100" y2="72" stroke="#78716c" strokeWidth="1" />
              <line x1="92" y1="64" x2="108" y2="64" stroke="#78716c" strokeWidth="1" />
            </g>
            <ellipse
              cx="45"
              cy="33"
              rx="5"
              ry="6.5"
              fill="#fff"
              stroke="#92400e"
              strokeWidth="1"
            />
            <text
              x="45"
              y="56"
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="#92400e"
              fontFamily="system-ui"
            >
              ÄGG
            </text>
            <circle cx="121" cy="55" r="2" fill="#fef9c3" />
          </svg>
        </div>
      </div>
    </div>
  );
}