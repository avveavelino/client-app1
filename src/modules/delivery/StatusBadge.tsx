import { cn } from "@/lib/utils";
import { STATUS_LABELS, type DeliveryStatus } from "./types";

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  pending: "bg-stone-100 text-stone-600 ring-stone-200",
  in_route: "bg-sky-50 text-sky-700 ring-sky-200",
  delivering: "bg-amber-50 text-amber-800 ring-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  done: "bg-stone-50 text-stone-500 ring-stone-200",
};

export function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset transition-colors",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}