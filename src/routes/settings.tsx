import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { AppShell } from "../components/shell/AppShell";
import { Section } from "@/components/shell/Section";
import { EmptyState } from "@/components/shell/EmptyState";
 
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
  return (
    <AppShell>
      <Section title="Inställningar">
        <EmptyState
          icon={<SettingsIcon className="h-5 w-5" />}
          title="Inga inställningar ännu"
          description="Inställningar för funktioner visas här."
        />
      </Section>
    </AppShell>
  );
}