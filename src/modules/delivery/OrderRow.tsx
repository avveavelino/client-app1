import { useState } from "react";
import { Mail, Phone, MapPin, Package, CalendarDays, StickyNote, ChevronDown } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);

  const hasProducts = !!order.products && order.products.length > 0;
  const hasContactActions = !!order.phone || !!order.email;

  const displayDate = order.deliveryDateText || order.deliveryDate;

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
            <div className="flex items-baseline gap-2">
              <p className="truncate text-[15px] font-semibold text-foreground">
                {order.customerName}
              </p>
              {order.orderDate && (
                <p className="shrink-0 text-[11px] text-stone-400">
                  ({formatOrderDate(order.orderDate)})
                </p>
              )}
            </div>
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
              <span className={expanded ? "" : "truncate"}>{order.address}</span>
            </Detail>
          )}
        </div>

        {expanded && (
          <div className="space-y-1 border-t border-stone-100 pt-2 text-xs text-muted-foreground">
            {hasProducts && (
              <Detail icon={<Package className="h-3.5 w-3.5" />} multiline>
                <ul className="space-y-0.5">
                  {order.products!.map((p, i) => (
                    <li key={i}>
                      {p.name} <span className="text-stone-400">x</span> {p.quantity}
                    </li>
                  ))}
                </ul>
              </Detail>
            )}

            {order.email && (
              <Detail icon={<Mail className="h-3.5 w-3.5" />}>
                <span className="break-all">{order.email}</span>
              </Detail>
            )}

            {order.phone && (
              <Detail icon={<Phone className="h-3.5 w-3.5" />}>
                {order.phone}
              </Detail>
            )}

            {displayDate && (
              <Detail icon={<CalendarDays className="h-3.5 w-3.5" />} multiline>
                <span className="whitespace-pre-wrap break-words">
                  <span className="font-medium text-stone-600">{"\u00D6nskad leverans:"}</span> {displayDate}
                </span>
              </Detail>
            )}

            {order.deliveryNote && (
              <Detail icon={<StickyNote className="h-3.5 w-3.5" />} multiline>
                <span className="whitespace-pre-wrap break-words">
                  <span className="font-medium text-stone-600">{"Portkod och plats:"}</span> {order.deliveryNote}
                </span>
              </Detail>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
        >
          {expanded ? "Visa mindre" : "Visa mer"}
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {expanded && hasContactActions && (
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
        title="Avstangd i installningar"
        onClick={(e) => e.stopPropagation()}
        className={`${baseClass} pointer-events-none border-stone-200 bg-stone-50 text-stone-400 ${fullWidth ? "w-full" : ""}`}
      >
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={`${baseClass} border-border bg-background text-foreground hover:-translate-y-px hover:border-stone-300 hover:bg-stone-50 active:translate-y-0 active:bg-stone-100 ${fullWidth ? "w-full" : ""}`}
    >
      {label}
    </a>
  );
}

function formatOrderDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return iso;
  }
}