import { Button } from "@/components/ui/button";

interface ClientLite {
  id: number | string;
  name: string;
  active?: boolean;
}

interface Props {
  clients: ClientLite[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AdminClientSelector({ clients, selectedId, onSelect }: Props) {
  if (!clients.length) {
    return (
      <p className="text-sm text-muted-foreground">Inga klienter hittades.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {clients.map((c) => {
        const id = String(c.id);
        const isSelected = id === selectedId;
        const inactive = c.active === false;

        return (
          <Button
            key={id}
            size="sm"
            variant={isSelected ? "default" : "outline"}
            onClick={() => onSelect(id)}
            className="gap-1.5"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                inactive ? "bg-rose-400" : "bg-emerald-400"
              }`}
              aria-hidden
            />
            {c.name}
            <span className="text-xs text-stone-400">#{id}</span>
          </Button>
        );
      })}
    </div>
  );
}