import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Truck,
  Eye,
  TriangleAlert,
  Power,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Inställningar" },
      { name: "description", content: "Hantera inställningar för appen." },
    ],
  }),
});

function SettingsPage() {
  // ===================== STATE =====================
  const [automationActive, setAutomationActive] = useState(true);
  const [autoReplies, setAutoReplies] = useState(true);
  const [orderConfirmations, setOrderConfirmations] = useState(true);
  const [deliveryUpdates, setDeliveryUpdates] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [showCompletedOrders, setShowCompletedOrders] = useState(true);
  const [showOldOrders, setShowOldOrders] = useState(false);

  // ===================== HANDLERS =====================
  const handlePauseAll = () => {
    const confirmed = window.confirm(
      "Är du säker på att du vill pausa all automation?\n\nDetta stänger av alla automatiska funktioner direkt.",
    );
    if (!confirmed) return;

    setAutomationActive(false);
    setAutoReplies(false);
    setDeliveryUpdates(false);
    setSmsNotifications(false);
  };

  // Sub-toggles only matter when the master is on
  const subDisabled = !automationActive;

  return (
    <AppShell>
      <div className="space-y-5">
        {/* ---------- HEADER ---------- */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Inställningar
          </h1>
          <p className="text-sm text-muted-foreground">
            Hantera automatisering och hur systemet beter sig.
          </p>
        </header>

        {/* ---------- 1. SYSTEMKONTROLL ---------- */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base">Systemkontroll</CardTitle>
            </div>
            <CardDescription>
              Detta styr om automatiska e-postmeddelanden, leveransuppdateringar
              och andra automatiska funktioner får köras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              id="automation_active"
              title="Automation aktiv"
              checked={automationActive}
              onChange={setAutomationActive}
            />

            <div
              className={`rounded-lg px-3 py-2.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                automationActive
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-rose-200"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    automationActive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                {automationActive
                  ? "Automatiska funktioner är aktiva"
                  : "Alla automatiska funktioner är pausade"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ---------- 2. E-POSTAUTOMATION ---------- */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">E-postautomation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              id="auto_replies"
              title="Automatiska e-postsvar"
              description="Svara automatiskt på inkommande kundmeddelanden."
              checked={autoReplies}
              onChange={setAutoReplies}
              disabled={subDisabled}
            />
            <Separator className="my-2" />
            <SettingRow
              id="order_confirmations"
              title="Skicka orderbekräftelser"
              description="Kunder får automatiska orderbekräftelser via e-post."
              checked={orderConfirmations}
              onChange={setOrderConfirmations}
              disabled={subDisabled}
            />
          </CardContent>
        </Card>

        {/* ---------- 3. LEVERANSNOTISER ---------- */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">Leveransnotiser</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              id="delivery_updates"
              title="Skicka leveransuppdateringar"
              description="Kunder meddelas när beställningar levereras."
              checked={deliveryUpdates}
              onChange={setDeliveryUpdates}
              disabled={subDisabled}
            />
            <Separator className="my-2" />
            <SettingRow
              id="sms_notifications"
              title="Aktivera SMS-notiser"
              description="Tillåt SMS-uppdateringar när telefonnummer finns."
              checked={smsNotifications}
              onChange={setSmsNotifications}
              disabled={subDisabled}
            />
          </CardContent>
        </Card>

        {/* ---------- 4. ORDERVISNING ---------- */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-stone-600" />
              <CardTitle className="text-base">Ordervisning</CardTitle>
            </div>
            <CardDescription>
              Styr vilka beställningar som visas i leveransöversikten.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              id="show_completed_orders"
              title="Visa slutförda beställningar"
              checked={showCompletedOrders}
              onChange={setShowCompletedOrders}
            />
            <Separator className="my-2" />
            <SettingRow
              id="show_old_orders"
              title="Visa äldre beställningar"
              checked={showOldOrders}
              onChange={setShowOldOrders}
            />
          </CardContent>
        </Card>

        {/* ---------- 5. SÄKERHET ---------- */}
        <Card className="rounded-2xl border-rose-200 bg-rose-50/30 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-rose-600" />
              <CardTitle className="text-base text-rose-900">
                Säkerhet
              </CardTitle>
            </div>
            <CardDescription className="text-rose-800/80">
              Detta pausar omedelbart alla automatiska funktioner tills de
              aktiveras igen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={handlePauseAll}
              className="w-full gap-2"
            >
              <Power className="h-4 w-4" />
              Pausa all automation
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

// ===================== HELPER: SETTING ROW =====================
function SettingRow({
  id,
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-2 transition-opacity ${
        disabled ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="min-w-0 flex-1">
        <Label
          htmlFor={id}
          className={`text-sm font-medium ${
            disabled ? "" : "cursor-pointer"
          }`}
        >
          {title}
        </Label>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}