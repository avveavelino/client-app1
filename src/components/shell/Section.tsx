import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, action, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
