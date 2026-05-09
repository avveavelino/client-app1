import { useState } from "react";
import { toast } from "sonner";
import { Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "./ConfirmDialog";
import { api } from "@/lib/api";

interface ClientLite {
  id: number | string;
  name: string;
  active?: boolean;
  orderCount?: number;
}

interface Props {
  client: ClientLite;
  onChanged: () => void;
}

export function AdminClientControls({ client, onChanged }: Props) {
  const [busy, setBusy] = useState<null | "pause" | "resume" | "reset">(null);
  const [confirmOpen, setConfirmOpen] = useState<null | "pause" | "reset">(null);

  const isPaused = client.active === false;

  const doPause = async () => {
    setBusy("pause");
    try {
      const res = await api("/admin/pause-client", {
        method: "POST",
        json: { client_id: client.id },
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || result?.status === "error") {
        toast.error(result?.message || "Kunde inte pausa klienten");
        return;
      }
      toast.success(`${client.name} pausad`);
      onChanged();
    } catch {
      toast.error("Något gick fel");
    } finally {
      setBusy(null);
      setConfirmOpen(null);
    }
  };

  const doResume = async () => {
    setBusy("resume");
    try {
      const res = await api("/admin/resume-client", {
        method: "POST",
        json: { client_id: client.id },
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || result?.status === "error") {
        toast.error(result?.message || "Kunde inte återuppta klienten");
        return;
      }
      toast.success(`${client.name} återupptagen`);
      onChanged();
    } catch {
      toast.error("Något gick fel");
    } finally {
      setBusy(null);
    }
  };

  const doReset = async () => {
    setBusy("reset");
    try {
      const res = await api("/admin/reset-orders", {
        method: "POST",
        json: { client_id: client.id, confirm: "RESET" },
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || result?.status === "error") {
        toast.error(result?.message || "Kunde inte återställa beställningar");
        return;
      }
      toast.success(
        `Återställde ${result?.cleared_count ?? 0} beställningar för ${client.name}`,
      );
      onChanged();
    } catch {
      toast.error("Något gick fel");
    } finally {
      setBusy(null);
      setConfirmOpen(null);
    }
  };

  return (
    <>
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{client.name}</CardTitle>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                isPaused
                  ? "bg-rose-50 text-rose-700 ring-rose-200"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isPaused ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />
              {isPaused ? "Pausad" : "Aktiv"}
            </span>
          </div>
          <CardDescription>
            {client.orderCount !== undefined
              ? `${client.orderCount} beställningar i systemet`
              : "Klientstyrning"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {isPaused ? (
              <Button
                variant="default"
                onClick={doResume}
                disabled={busy !== null}
                className="gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                Återuppta
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setConfirmOpen("pause")}
                disabled={busy !== null}
                className="gap-1.5"
              >
                <Pause className="h-3.5 w-3.5" />
                Pausa
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => setConfirmOpen("reset")}
              disabled={busy !== null}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Återställ beställningar
            </Button>
          </div>
          <p className="text-[11px] text-stone-400">
            Pausade klienter får inga nya importer, automatiska e-postsvar eller leveransnotiser.
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen === "pause"}
        title={`Pausa ${client.name}?`}
        description={
          "All automation för denna klient stoppas:\n" +
          "• Inga nya beställningar importeras\n" +
          "• Inga automatiska e-postsvar\n" +
          "• Inga leveransnotiser skickas\n\n" +
          "Befintlig data påverkas inte. Du kan återuppta när som helst."
        }
        confirmText="Pausa"
        destructive
        onConfirm={doPause}
        onCancel={() => setConfirmOpen(null)}
      />

      <ConfirmDialog
        open={confirmOpen === "reset"}
        title={`Återställ alla beställningar för ${client.name}?`}
        description={
          "Detta tar bort ALLA beställningar för denna klient. Åtgärden kan inte ångras.\n\n" +
          "Andra klienter påverkas inte."
        }
        confirmText="Radera beställningar"
        destructive
        typedConfirmation="RESET"
        onConfirm={doReset}
        onCancel={() => setConfirmOpen(null)}
      />
    </>
  );
}