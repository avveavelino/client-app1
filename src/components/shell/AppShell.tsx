import type { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
