import { Route, Play, Truck, CheckCircle2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DeliveryAction =
  | "optimize"
  | "start"
  | "delivering"
  | "delivered"
  | "end";

interface Props {
  selectedCount: number;
  onAction: (action: DeliveryAction) => void;
  allowDeliveryUpdates?: boolean;
  allowRouteOptimization?: boolean;
  allowRouteStart?: boolean;
}

const ROUTE_ACTIONS = [
  { id: "optimize", label: "Optimera rutt", icon: Route, variant: "outline" },
  { id: "start", label: "Starta rutt", icon: Play, variant: "default" },
  { id: "end", label: "Avsluta rutt", icon: Square, variant: "outline" },
] as const;

const STATUS_ACTIONS = [
  { id: "delivering", label: "Markera levererar", icon: Truck, variant: "secondary" },
  { id: "delivered", label: "Markera levererad", icon: CheckCircle2, variant: "secondary" },
] as const;

export function DeliveryActions({
  selectedCount,
  onAction,
  allowDeliveryUpdates = true,
  allowRouteOptimization = true,
  allowRouteStart = true,
}: Props) {
  const noSelection = selectedCount === 0;

  // Per-action lockout from settings
  const isActionLocked = (id: DeliveryAction) => {
    if (id === "optimize" && !allowRouteOptimization) return true;
    if ((id === "start" || id === "end") && !allowRouteStart) return true;
    if ((id === "delivering" || id === "delivered") && !allowDeliveryUpdates)
      return true;
    return false;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Åtgärder</p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset transition-all ${
            noSelection
              ? "bg-stone-50 text-stone-400 ring-stone-200"
              : "bg-amber-50 text-amber-800 ring-amber-200"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              noSelection ? "bg-stone-300" : "bg-amber-500"
            }`}
          />
          {selectedCount} valda
        </span>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {ROUTE_ACTIONS.map((a) => {
            const Icon = a.icon;
            const locked = isActionLocked(a.id);
            const disabled = noSelection || locked;
            return (
              <Button
                key={a.id}
                size="sm"
                variant={a.variant}
                disabled={disabled}
                onClick={() => onAction(a.id)}
                className="h-9 justify-start gap-1.5 text-xs transition-all duration-150 hover:-translate-y-px disabled:hover:translate-y-0"
                title={locked ? "Avstängd i inställningar" : undefined}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{a.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {STATUS_ACTIONS.map((a) => {
            const Icon = a.icon;
            const locked = isActionLocked(a.id);
            const disabled = noSelection || locked;
            return (
              <Button
                key={a.id}
                size="sm"
                variant={a.variant}
                disabled={disabled}
                onClick={() => onAction(a.id)}
                className="h-9 justify-start gap-1.5 text-xs transition-all duration-150 hover:-translate-y-px disabled:hover:translate-y-0"
                title={locked ? "Avstängd i inställningar" : undefined}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{a.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {noSelection && (
        <p className="mt-3 text-[11px] text-stone-400">
          Välj minst en order för att aktivera åtgärder
        </p>
      )}
    </div>
  );
}