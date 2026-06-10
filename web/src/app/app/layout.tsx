"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Portfolio" },
  { href: "/app/chronicle", label: "Chronicle" },
  { href: "/app/chat", label: "Ask Axiom" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-sm font-medium text-foreground tracking-wide">a-MANT</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
          <span className="text-xs text-muted-foreground">Axiom active</span>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-md">
        <div className="flex">
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex items-center justify-center py-4 text-xs font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute bottom-0 w-8 h-px bg-accent" />
                )}
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
