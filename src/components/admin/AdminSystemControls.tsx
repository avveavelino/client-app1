import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldOff, ShieldCheck } from "lucide-react";
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

export function AdminSystemControls() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const refresh = async () => {
    try {
      const res = await api("/admin/system-status");
      const data = await res.json().catch(() => null);
      if (data && typeof data.system_enabled === "boolean") {
        setEnabled(data.system_enabled);
      }
    } catch {
      // Network failure — don't crash UI
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const doPause = async () => {
    setBusy(true);
    try {
      const res = await api("/admin/system-pause", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.status === "error") {
        toast.error("Kunde inte pausa systemet");
        return;
      }
      setEnabled(false);
      toast.success("Globalt system pausat");
    } catch {
      toast.error("Något gick fel");
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const doResume = async () => {
    setBusy(true);
    try {
      const res = await api("/admin/system-resume", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.status === "error") {
        toast.error("Kunde inte återuppta systemet");
        return;
      }
      setEnabled(true);
      toast.success("Globalt system återupptaget");
    } catch {
      toast.error("Något gick fel");
    } finally {
      setBusy(false);
    }
  };

  const isPaused = enabled === false;

  return (
    <>
      <Card
        className={`rounded-2xl shadow-sm ${
          isPaused
            ? "border-rose-200 bg-rose-50/30"
            : "border-border/70"
        }`}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            {isPaused ? (
              <ShieldOff className="h-4 w-4 text-rose-600" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            )}
            <CardTitle className="text-base">Globalt system</CardTitle>
          </div>
          <CardDescription>
            Påverkar alla klienter samtidigt. Använd vid akuta fel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className={`rounded-lg px-3 py-2 text-xs font-medium ring-1 ring-inset ${
              enabled === null
                ? "bg-stone-50 text-stone-500 ring-stone-200"
                : isPaused
                  ? "bg-rose-50 text-rose-700 ring-rose-200"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-200"
            }`}
          >
            {enabled === null
              ? "Hämtar status…"
              : isPaused
                ? "Hela systemet är pausat"
                : "Hela systemet är aktivt"}
          </div>

          {isPaused ? (
            <Button onClick={doResume} disabled={busy} className="w-full">
              Återuppta hela systemet
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={busy || enabled === null}
              className="w-full"
            >
              Pausa hela systemet
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Pausa hela systemet?"
        description={
          "All automation för ALLA klienter stoppas direkt:\n" +
          "• Inga nya beställningar importeras\n" +
          "• Inga automatiska e-postsvar\n" +
          "• Inga leveransnotiser skickas\n\n" +
          "Använd endast vid akuta fel."
        }
        confirmText="Pausa hela systemet"
        destructive
        typedConfirmation="PAUSE"
        onConfirm={doPause}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}