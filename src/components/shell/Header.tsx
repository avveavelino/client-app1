import { appConfig } from "@/config/app";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {appConfig.name}
        </h1>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-secondary-foreground">
            {appConfig.status}
          </span>
        </div>
      </div>
    </header>
  );
}
