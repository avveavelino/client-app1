import { cn } from "@/lib/utils";
import { STATUS_CLASSES, STATUS_LABELS, type DeliveryStatus } from "./types";

export function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        STATUS_CLASSES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
