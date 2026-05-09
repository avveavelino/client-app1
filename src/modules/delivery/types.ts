export type DeliveryStatus =
  | "pending"
  | "in_route"
  | "delivering"
  | "delivered"
  | "done";

export interface OrderProduct {
  name: string;
  quantity: number;
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  address: string;
  status: DeliveryStatus;
  deliveryDate?: string;       // ISO YYYY-MM-DD — internal use only
  deliveryDateText?: string;   // Display string — what the customer wrote
  email?: string;
  phone?: string;
  products?: OrderProduct[];
  price?: string;
  deliveryNote?: string;
}

export const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "Väntar",
  in_route: "På rutt",
  delivering: "På väg",
  delivered: "Levererad",
  done: "Klar",
};

export const STATUS_CLASSES: Record<DeliveryStatus, string> = {
  pending: "bg-status-pending text-status-pending-foreground",
  in_route: "bg-status-in-route text-status-in-route-foreground",
  delivering: "bg-status-delivering text-status-delivering-foreground",
  delivered: "bg-status-delivered text-status-delivered-foreground",
  done: "bg-status-done text-status-done-foreground",
};