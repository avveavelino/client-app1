import { Mail, Phone, MapPin, Package, Coins, Truck, StickyNote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusBadge";
import type { DeliveryOrder } from "./types";

interface Props {
  order: DeliveryOrder;
  selected: boolean;
  onToggle: (id: string) => void;
  contactFlags?: { sms: boolean; call: boolean; email: boolean };
}

export function OrderRow({
  order,
  selected,
  onToggle,
  contactFlags = { sms: true, call: true, email: true },
}: Props) {
  const hasProducts = !!order.products && order.products.length > 0;
  const hasContactActions = !!order.phone || !!order.email;

  return (
    <label
      htmlFor={`order-${order.id}`}
      className={`group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-amber-300/60 bg-amber-50/40 shadow-md"
          : "border-border/70 hover:border-border"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 bg-amber-400 transition-opacity duration-200 ${
          selected ? "opacity-100" : "opacity-0"
        }`}
      />

      <Checkbox
        id={`order-${order.id}`}
        checked={selected}
        onCheckedChange={() => onToggle(order.id)}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-foreground">
              {order.customerName}
            </p>
            {order.price && (
              <p className="mt-0.5 text-xs font-medium text-stone-600">
                {order.price}
              </p>
            )}
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {order.address && (
            <Detail icon={<MapPin className="h-3.5 w-3.5" />}>
              <span className="truncate">{order.address}</span>
            </Detail>
          )}

          {order.deliveryDate && (
            <Detail icon={<Truck className="h-3.5 w-3.5" />}>
              {order.deliveryDate}
            </Detail>
          )}

          {hasProducts && (
            <Detail icon={<Package className="h-3.5 w-3.5" />} multiline>
              <ul className="space-y-0.5">
                {order.products!.map((p, i) => (
                  <li key={i}>
                    {p.name} <span className="text-stone-400">×</span> {p.quantity}
                  </li>
                ))}
              </ul>
            </Detail>
          )}

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

          {order.deliveryNote && (
            <Detail icon={<StickyNote className="h-3.5 w-3.5" />}>
              <span className="truncate">{order.deliveryNote}</span>
            </Detail>
          )}
        </div>

        {hasContactActions && (
          <div className="space-y-1.5 pt-1">
            {order.phone && (
              <div className="grid grid-cols-2 gap-1.5">
                <ContactButton
                  href={`sms:${order.phone}`}
                  label="SMS"
                  disabled={!contactFlags.sms}
                />
                <ContactButton
                  href={`tel:${order.phone}`}
                  label="Ring"
                  disabled={!contactFlags.call}
                />
              </div>
            )}
            {order.email && (
              <ContactButton
                href={`mailto:${order.email}`}
                label="E-post"
                fullWidth
                disabled={!contactFlags.email}
              />
            )}
          </div>
        )}
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
      <span className={`shrink-0 text-stone-400 ${multiline ? "mt-0.5" : ""}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function ContactButton({
  href,
  label,
  fullWidth,
  disabled,
}: {
  href: string;
  label: string;
  fullWidth?: boolean;
  disabled?: boolean;
}) {
  const baseClass =
    "flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-150";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Avstängd i inställningar"
        onClick={(e) => e.stopPropagation()}
        className={`${baseClass} pointer-events-none border-stone-200 bg-stone-50 text-stone-400 ${fullWidth ? "w-full" : ""}`}
      >
        {label}
      </span>
    );
  }

  return (
    
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={`${baseClass} border-border bg-background text-foreground hover:-translate-y-px hover:border-stone-300 hover:bg-stone-50 active:translate-y-0 active:bg-stone-100 ${fullWidth ? "w-full" : ""}`}
    >
      {label}
    </a>
  );
}