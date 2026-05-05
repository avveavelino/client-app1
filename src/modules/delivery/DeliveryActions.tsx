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
}
 
const ACTIONS = [
  { id: "optimize", label: "Optimera rutt", icon: Route, variant: "outline" },
  { id: "start", label: "Starta rutt", icon: Play, variant: "default" },
  { id: "delivering", label: "Markera som levererar", icon: Truck, variant: "secondary" },
  { id: "delivered", label: "Markera som levererad", icon: CheckCircle2, variant: "secondary" },
  { id: "end", label: "Avsluta rutt", icon: Square, variant: "outline" },
] as const;
 
export function DeliveryActions({ selectedCount, onAction }: Props) {
  const disabled = selectedCount === 0;
 
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">Åtgärder</p>
        <p className="text-xs text-muted-foreground">
          {selectedCount} valda
        </p>
      </div>
 
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Button
              key={a.id}
              size="sm"
              variant={a.variant}
              disabled={disabled}
              onClick={() => onAction(a.id)}
              className="justify-start"
            >
              <Icon />
              <span className="truncate">{a.label}</span>
            </Button>
          );
        })}
      </div>
 
      {disabled && (
        <p className="text-[11px] text-muted-foreground">
          Välj minst en order för att aktivera åtgärder
        </p>
      )}
    </div>
  );
}