import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Mail,
  Truck,
  Eye,
  TriangleAlert,
  Power,
  Route as RouteIcon,
  Users,
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
import { useSettings } from "@/lib/settings-store";

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
  const { settings, update, updateMany } = useSettings();

  // Sub-toggles only matter when the master is on.
  // Display toggles (showCompletedOrders/showOldOrders) are NEVER tied to it.
  const subDisabled = !settings.automationActive;

  // Customer contact module has its own master.
  const contactSubDisabled = !settings.customerContactActive;

  const handlePauseAll = () => {
    const confirmed = window.confirm(
      "Är du säker på att du vill pausa all automation?\n\nDetta stänger av alla automatiska funktioner direkt.",
    );
    if (!confirmed) return;

    updateMany({
      automationActive: false,
      autoReplies: false,
      deliveryUpdates: false,
      smsNotifications: false,
    });
  };

  return (
    <AppShell>
      <div className="space-y-5">
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
              checked={settings.automationActive}
              onChange={(v) => update("automationActive", v)}
            />

            <div
              className={`rounded-lg px-3 py-2.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                settings.automationActive
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-rose-200"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    settings.automationActive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                {settings.automationActive
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
              checked={settings.autoReplies}
              onChange={(v) => update("autoReplies", v)}
              disabled={subDisabled}
            />
            <Separa