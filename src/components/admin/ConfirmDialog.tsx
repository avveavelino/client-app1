import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  /** If set, user must type this exact string to enable the confirm button. */
  typedConfirmation?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Bekräfta",
  cancelText = "Avbryt",
  destructive = false,
  typedConfirmation,
  onConfirm,
  onCancel,
}: Props) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  if (!open) return null;

  const canConfirm = typedConfirmation ? typed === typedConfirmation : true;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className={`text-base font-semibold ${
            destructive ? "text-rose-700" : "text-foreground"
          }`}
        >
          {title}
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
          {description}
        </p>

        {typedConfirmation && (
          <div className="mt-4">
            <label className="block text-xs text-muted-foreground">
              Skriv <span className="font-mono font-semibold">{typedConfirmation}</span> för att bekräfta
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}