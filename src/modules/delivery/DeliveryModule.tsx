import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderRow } from "./OrderRow";
import { DeliveryActions, type DeliveryAction } from "./DeliveryActions";
import type { DeliveryOrder, DeliveryStatus } from "./types";

interface Props {
  clientId: number;
  initialOrders?: DeliveryOrder[];
  allowDeliveryUpdates?: boolean;
  allowRouteOptimization?: boolean;
  allowRouteStart?: boolean;
  contactFlags?: { sms: boolean; call: boolean; email: boolean };
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

const API_URL = "https://automation-system-production-2711.up.railway.app";

function startOfThisWeek(now = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = d.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  d.setDate(d.getDate() - daysSinceMonday);
  return d;
}

function isThisWeek(deliveryDate: string | undefined, weekStart: Date): boolean {
  if (!deliveryDate) return true;
  const t = new Date(deliveryDate).getTime();
  if (isNaN(t)) return true;
  return t >= weekStart.getTime();
}

type Celebration = "van" | "egg" | null;

export function DeliveryModule({
  clientId,
  initialOrders = [],
  allowDeliveryUpdates = true,
  allowRouteOptimization = true,
  allowRouteStart = true,
  contactFlags = { sms: true, call: true, email: true },
}: Props) {
  const [orders, setOrders] = useState<DeliveryOrder[]>(initialOrders);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<DeliveryAction | null>(null);
  const [lastWeekOpen, setLastWeekOpen] = useState(false);
  const [celebration, setCelebration] = useState<Celebration>(null);

  // Keep local list in sync if parent changes the filter (e.g. settings toggled)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

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

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), celebration === "van" ? 3200 : 2200);
    return () => clearTimeout(t);
  }, [celebration]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(orders.map((o) => o.id)));
  };

  const updateSelected = (status: DeliveryStatus) => {
    setOrders((prev) =>
      prev.map((o) => (selected.has(o.id) ? { ...o, status } : o)),
    );
  };

  const handleAction = async (action: DeliveryAction) => {
    // optimize and start require selection. Others work on all eligible orders.
    const needsSelection = action === "optimize" || action === "start";
    if (needsSelection && selected.size === 0) {
      toast.warning("Välj minst en order först");
      return;
    }
    if (pendingAction) return;

    const orderIds = Array.from(selected);
    const endpoint = ACTION_ENDPOINT[action];

    setPendingAction(action);

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
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

          // Build Google Maps directions URL using the official format that
          // deep-links into the Maps app on iOS/Android and works on desktop.
          // https://developers.google.com/maps/documentation/urls/get-started#directions-action
          const stops = route.map((a) => String(a).trim()).filter(Boolean);

          if (stops.length < 2) {
            toast.error("Behöver minst två stopp för att skapa rutt");
            return;
          }

          const origin = encodeURIComponent(stops[0]);
          const destination = encodeURIComponent(stops[stops.length - 1]);
          const waypoints = stops
            .slice(1, -1)
            .map((s) => encodeURIComponent(s))
            .join("|");

          const params = new URLSearchParams();
          params.set("api", "1");
          params.set("travelmode", "driving");

          // Build the URL manually so | in waypoints doesn't get re-encoded.
          let url =
            `https://www.google.com/maps/dir/?api=1` +
            `&origin=${origin}` +
            `&destination=${destination}` +
            `&travelmode=driving`;

          if (waypoints) {
            url += `&waypoints=${waypoints}`;
          }

          // Same-tab navigation. window.open with _blank can be blocked by
          // mobile browsers and prevents the deep-link to the Maps app.
          window.location.href = url;
          break;
        }
        case "start":
          updateSelected("in_route");
          setCelebration("van");
          break;
        case "delivering":
          setOrders((prev) =>
            prev.map((o) =>
              o.status === "in_route"
                ? { ...o, status: "delivering" }
                : o
            )
          );
          break;
        case "delivered":
          setOrders((prev) =>
            prev.map((o) =>
              o.status === "delivering"
                ? { ...o, status: "delivered" }
                : o
           )
          );
          break;
        case "end":
          updateSelected("done");
          setSelected(new Set());
          setCelebration("egg");
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
    <ul className="space-y-2.5">
      {list.map((o, i) => (
        <li
          key={o.id}
          className="opacity-0 [animation:fadeUp_0.4s_ease-out_forwards]"
          style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
        >
          <OrderRow
            order={o}
            selected={selected.has(o.id)}
            onToggle={toggle}
            contactFlags={contactFlags}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative space-y-5">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes vanDrive {
          0%   { transform: translateX(-180px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 60px)); opacity: 0; }
        }
        @keyframes vanBounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes eggRoll {
          0%   { transform: translateX(-60px) rotate(0deg); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(calc(100vw + 30px)) rotate(720deg); opacity: 0; }
        }
        @keyframes chickBob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
      `}</style>

      <DeliveryActions
        selectedCount={selected.size}
        onAction={handleAction}
        allowDeliveryUpdates={allowDeliveryUpdates}
        allowRouteOptimization={allowRouteOptimization}
        allowRouteStart={allowRouteStart}
      />

      {orders.length === 0 ? (
        <EggEmptyState />
      ) : (
        <>
          {thisWeek.length > 0 && (
            <section>
              <SectionHeader
                title="Denna vecka"
                subtitle={`${thisWeek.length} ${thisWeek.length === 1 ? "order" : "ordrar"}`}
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleSelectAll}
                    className="h-8 px-2.5 text-xs"
                  >
                    {allSelected ? "Rensa alla" : "Välj alla"}
                  </Button>
                }
              />
              {renderOrderList(thisWeek)}
            </section>
          )}

          {lastWeek.length > 0 && (
            <section className="opacity-80 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={() => setLastWeekOpen((v) => !v)}
                className="mb-3 flex w-full items-center justify-between rounded-lg px-1 py-1 text-left transition-colors hover:bg-stone-50"
              >
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-semibold text-stone-600">Förra veckan</h2>
                  <span className="text-xs text-stone-400">
                    {lastWeek.length} {lastWeek.length === 1 ? "order" : "ordrar"}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${
                    lastWeekOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {lastWeekOpen && renderOrderList(lastWeek)}
            </section>
          )}
        </>
      )}

      {celebration === "van" && <DeliveryVanAnimation />}
      {celebration === "egg" && <RollingEggAnimation />}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && <span className="text-xs text-stone-400">{subtitle}</span>}
      </div>
      {action}
    </div>
  );
}

function EggEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 px-6 py-12 text-center">
      <ChickIllustration />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Inga ordrar än</p>
        <p className="text-xs text-stone-500">
          Nya beställningar dyker upp här automatiskt.
        </p>
      </div>
    </div>
  );
}

function ChickIllustration() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none" aria-hidden className="text-amber-400">
      <ellipse cx="48" cy="74" rx="22" ry="2.5" fill="#000" opacity="0.08" />
      <path d="M22 60 L74 60 L70 72 L26 72 Z" fill="#d6a26a" stroke="#a47445" strokeWidth="1.2" />
      <path d="M22 60 L74 60" stroke="#a47445" strokeWidth="1.2" />
      {[28, 36, 44, 52, 60, 68].map((x) => (
        <line key={x} x1={x} y1={60} x2={x - 1} y2={72} stroke="#a47445" strokeWidth="0.8" />
      ))}
      <ellipse cx="34" cy="58" rx="6" ry="7" fill="#fff8ec" stroke="#e8d5a8" strokeWidth="0.8" />
      <ellipse cx="48" cy="56" rx="6" ry="7" fill="#fff8ec" stroke="#e8d5a8" strokeWidth="0.8" />
      <ellipse cx="62" cy="58" rx="6" ry="7" fill="#fff8ec" stroke="#e8d5a8" strokeWidth="0.8" />
      <g style={{ animation: "chickBob 3s ease-in-out infinite", transformOrigin: "48px 35px" }}>
        <ellipse cx="48" cy="38" rx="14" ry="12" fill="#fcd34d" />
        <circle cx="48" cy="24" r="9" fill="#fcd34d" />
        <path d="M40 38 Q44 34 48 38 Q44 44 40 42 Z" fill="#f59e0b" opacity="0.5" />
        <path d="M55 24 L60 25 L55 27 Z" fill="#f97316" />
        <circle cx="51" cy="22" r="1.4" fill="#1c1917" />
        <line x1="44" y1="49" x2="44" y2="52" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="52" y1="49" x2="52" y2="52" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function DeliveryVanAnimation() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex items-end justify-start"
      style={{ animation: "vanDrive 3s ease-in-out forwards" }}
    >
      <div style={{ animation: "vanBounce 0.4s ease-in-out infinite" }}>
        <svg width="140" height="80" viewBox="0 0 140 80" fill="none">
          <ellipse cx="70" cy="73" rx="55" ry="2.5" fill="#000" opacity="0.12" />
          <rect x="10" y="22" width="70" height="40" rx="3" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
          <rect x="10" y="40" width="70" height="3" fill="#f59e0b" />
          <path d="M80 30 L110 30 L122 45 L122 62 L80 62 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.5" />
          <path d="M85 33 L107 33 L116 45 L85 45 Z" fill="#bae6fd" stroke="#0c4a6e" strokeWidth="1" />
          <g style={{ transformOrigin: "30px 64px", animation: "wheelSpin 0.4s linear infinite" }}>
            <circle cx="30" cy="64" r="8" fill="#1c1917" />
            <circle cx="30" cy="64" r="3" fill="#78716c" />
            <line x1="30" y1="56" x2="30" y2="72" stroke="#78716c" strokeWidth="1" />
            <line x1="22" y1="64" x2="38" y2="64" stroke="#78716c" strokeWidth="1" />
          </g>
          <g style={{ transformOrigin: "100px 64px", animation: "wheelSpin 0.4s linear infinite" }}>
            <circle cx="100" cy="64" r="8" fill="#1c1917" />
            <circle cx="100" cy="64" r="3" fill="#78716c" />
            <line x1="100" y1="56" x2="100" y2="72" stroke="#78716c" strokeWidth="1" />
            <line x1="92" y1="64" x2="108" y2="64" stroke="#78716c" strokeWidth="1" />
          </g>
          <ellipse cx="45" cy="33" rx="5" ry="6.5" fill="#fff" stroke="#92400e" strokeWidth="1" />
          <text x="45" y="56" textAnchor="middle" fontSize="9" fontWeight="700" fill="#92400e" fontFamily="system-ui">
            ÄGG
          </text>
          <circle cx="121" cy="55" r="2" fill="#fef9c3" />
        </svg>
      </div>
    </div>
  );
}

function RollingEggAnimation() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-12 z-50"
      style={{ animation: "eggRoll 2s ease-in-out forwards" }}
    >
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
        <ellipse cx="18" cy="36" rx="14" ry="2" fill="#000" opacity="0.1" />
        <ellipse cx="18" cy="22" rx="13" ry="17" fill="#fff8ec" stroke="#d4a574" strokeWidth="1.2" />
        <circle cx="14" cy="18" r="1" fill="#d4a574" opacity="0.6" />
        <circle cx="22" cy="14" r="0.8" fill="#d4a574" opacity="0.6" />
        <circle cx="20" cy="28" r="0.8" fill="#d4a574" opacity="0.6" />
        <circle cx="13" cy="26" r="0.6" fill="#d4a574" opacity="0.5" />
      </svg>
    </div>
  );
}