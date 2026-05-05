import { Mail, Phone, MapPin, Package, Coins, Truck, StickyNote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusBadge";
import type { DeliveryOrder } from "./types";

interface Props {
  order: DeliveryOrder;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function OrderRow({ order, selected, onToggle }: Props) {
  const hasProducts = !!order.products && order.products.length > 0;

  return (
    <label
      htmlFor={`order-${order.id}`}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/40 has-[:checked]:border-primary has-[:checked]:bg-accent/30"
    >
      <Checkbox
        id={`order-${order.id}`}
        checked={selected}
        onCheckedChange={() => onToggle(order.id)}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {order.customerName}
          </p>
          <StatusBadge status={order.status} />
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {order.email && (
            <Detail icon={<Mail className="h-3.5 w-3.5" />}>
              <span className="truncate">{order.email}</span>
            </Detail>
          )}

          {order.phone && (
            <Detail icon={<Phone className="h-3.5 w-3.5" />}>
              {order.phone}
            </Detail>
          )}

          {order.address && (
            <Detail icon={<MapPin className="h-3.5 w-3.5" />}>
              <span className="truncate">{order.address}</span>
            </Detail>
          )}

          {hasProducts && (
            <Detail icon={<Package className="h-3.5 w-3.5" />} multiline>
              <ul className="space-y-0.5">
                {order.products!.map((p, i) => (
                  <li key={i}>
                    {p.name} × {p.quantity}
                  </li>
                ))}
              </ul>
            </Detail>
          )}

          {order.price && (
            <Detail icon={<Coins className="h-3.5 w-3.5" />}>
              {order.price}
            </Detail>
          )}

          {order.deliveryDate && (
            <Detail icon={<Truck className="h-3.5 w-3.5" />}>
              {order.deliveryDate}
            </Detail>
          )}

          {order.deliveryNote && (
            <Detail icon={<StickyNote className="h-3.5 w-3.5" />}>
              <span className="truncate">{order.deliveryNote}</span>
            </Detail>
          )}
        </div>
      </div>
    </label>
  );
}

function Detail({
  icon,
  children,
  multiline,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className={`flex gap-1.5 ${multiline ? "items-start" : "items-center"}`}>
      <span className={`shrink-0 text-muted-foreground ${multiline ? "mt-0.5" : ""}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}