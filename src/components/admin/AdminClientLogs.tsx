import { useEffect, useState } from "react";
import { ScrollText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";

interface LogEntry {
  timestamp: string;
  client: string;
  action: string;
}

interface Props {
  clientName: string;
}

export function AdminClientLogs({ clientName }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api("/logs");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all: LogEntry[] = Array.isArray(data?.logs) ? data.logs : [];
      // Filter to this client
      setLogs(all.filter((l) => l.client === clientName).slice(-50).reverse());
    } catch (e: any) {
      setError(e?.message ?? "Kunde inte hämta loggar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientName]);

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollText className="h-4 w-4 text-stone-600" />
            Senaste händelser
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={refresh}
            disabled={loading}
            className="h-7 gap-1.5 px-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Uppdatera
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-xs text-rose-600">Fel: {error}</p>
        )}
        {!error && logs.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground">
            Inga händelser för {clientName} än.
          </p>
        )}
        {logs.length > 0 && (
          <ul className="space-y-1.5">
            {logs.map((log, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 rounded-md border border-stone-100 bg-stone-50/50 px-2.5 py-1.5"
              >
                <span className="font-mono text-[11px] text-stone-600">
                  {log.action}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-stone-400">
                  {log.timestamp}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}