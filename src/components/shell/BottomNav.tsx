import { Link } from "@tanstack/react-router";
import { navItems } from "@/config/navigation";

export function BottomNav() {
  const items = navItems.filter((i) => i.enabled);

  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex-1">
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
